from airflow import DAG
from airflow.operators.python import PythonOperator, PythonVirtualenvOperator
from airflow.providers.elasticsearch.hooks.elasticsearch import ElasticsearchPythonHook
from elasticsearch.helpers import scan
from elasticsearch import Elasticsearch
import os
from typing import Dict

from datetime import timedelta
from datariver.sensors.filesystem import MultipleFilesSensor

# Task expects list of strings containing file names.
# It opens every file from the list, performs language detection and groups the files based on detected language
# def detect_language(files: list[str]):
def detect_language(ti):
    import langdetect
    files = ti.xcom_pull(key="return_value", task_ids="wait_for_files")
    langs = {}
    print(files)
    for file_path in files:
        try:
            with open(file_path, "r") as f:
                text = f.read()
                lang = langdetect.detect(text) 
                if lang not in langs:
                    langs[lang] = []
                langs[lang].append(file_path)
        except IOError:
            print("There was an error when processing file: " + file_path)
            # TODO handle error
    ti.xcom_push(key="langs", value=langs)
    return langs


MAX_FRAGMENT_LENGTH = 4000

# https://github.com/alyssaq/nltk_data/blob/master/tokenizers/punkt/README
language_names = {
    'cz': 'czech',
    'da': 'danish',
    'nl': 'dutch',
    'en': 'english',
    'et': 'estonian',
    'fi': 'finnish',
    'fr': 'french',
    'de': 'german',
    'el': 'greek',
    'it': 'italian',
    'no': 'norwegian',
    'pl': 'polish',
    'pt': 'portuguese',
    'ru': 'russian',
    'sl': 'slovene',
    'es': 'spanish',
    'sv': 'swedish',
    'tr': 'turkish'
}

# Task translates text files, based on received dict from "detect_languages".
def translate(ti):
    import nltk
    from deep_translator import GoogleTranslator

    langs: Dict[str, list[str]] = ti.xcom_pull(key="return_value", task_ids="detect_language")
    
    nltk.download("punkt")  # download sentence tokenizer used for splitting text to sentences

    for lang in langs:
        if lang == "en":
            continue
        
        translator = GoogleTranslator(source=lang, target="en") 

        print("Translating language: " , lang)
        for file_path in langs[lang]:
            # Rename source text file - we mark it as being in use,
            # so we can simultaneously read from it and put translated text to a new file.
            # It allows reusage of the old Xcom list from "fetch_data" task.

            new_path = file_path + ".old"
            os.rename(file_path, new_path)

            try:
                with open(new_path, "r") as f, open(file_path, "a") as new_f:
                    # We probably shouldn't read the whole text file at once - what if the file is REALLY big? 
                    text = f.read()

                    # split text to sentences, so we can translate only a fragment instead of the whole file
                    sentences = nltk.tokenize.sent_tokenize(text, language=language_names[lang])

                    l = 0
                    r = 0
                    total_length = 0

                    while r < len(sentences):
                        if total_length + len(sentences[r]) < MAX_FRAGMENT_LENGTH:
                            total_length += len(sentences[r])                            
                        else:
                            to_translate = " ".join(sentences[l : r + 1])
                            translation = translator.translate(to_translate)
                            new_f.write(translation)        # perhaps we should make sure that we use proper char encoding when writing to file?
                            l = r + 1
                            total_length = 0
                        r += 1
                    else:
                        to_translate = " ".join(sentences[l : r + 1])
                        translation = translator.translate(to_translate)
                        new_f.write(translation)

            except IOError:
                raise Exception(f"Couldn't open {file_path}!")
                


def detect_entities(ti):
    import spacy    
    import nltk

    nltk.download("punkt")  # download sentence tokenizer used for splitting text to sentences
    files = ti.xcom_pull(key="return_value", task_ids="wait_for_files")

    es = Elasticsearch(
        os.environ["ELASTIC_HOST"],
        api_key=os.environ["ELASTIC_API_KEY"],
        timeout=60
    )
    # delete index named-entities; TODO: change this in future
    es.options(ignore_status=[400,404]).indices.delete(index='named-entities')
    document = {}
    for file in files:
        nlp = spacy.load("en_core_web_md")
        # get basename and trim extension
        id:str = os.path.splitext(os.path.basename(file))[0]
        document[id] = []
        try:
            with open(file, "r") as f: 
                text = f.read()
                sentences = nltk.tokenize.sent_tokenize(text, "english")
                for s in sentences:
                    doc = nlp(s)
                    document[id].append(doc.to_json())
                    # doc[*].ent - named entity detected by nlp
                    # doc[*].ent.label_ - label assigned to text fragment (e.g. Google -> Company, 30 -> Cardinal)
                    # doc[*].sent - sentence including given entity
        except IOError:
            raise Exception("Given file doesn't exist!")
        
    es.index(
        index="named-entities",
        document=document
    )

    
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
}


FS_CONN_ID = "fs_text_data"    #id of connection defined in Airflow UI
FILE_NAME = "ner/*.txt"


with DAG(
    'ner_workflow_custom',
    default_args=default_args,
    schedule_interval=None,
    render_template_as_native_obj=True      # REQUIRED TO RENDER TEMPLATE TO NATIVE LIST INSTEAD OF STRING!!!
) as dag:
    from datariver.operators.langdetect import LangdetectOperator

    detect_files = MultipleFilesSensor(
        task_id="wait_for_files",
        fs_conn_id=FS_CONN_ID,
        filepath=FILE_NAME,
        poke_interval=60,
        mode="reschedule",
        timeout=timedelta(minutes=60),
    )

    detect_language_task = LangdetectOperator(
        task_id="detect_language",
        files="{{task_instance.xcom_pull('wait_for_files')}}"
    )

    translate_task = PythonOperator(
        task_id='translate',
        python_callable=translate,
    )

    entity_detection_task = PythonOperator(
        task_id="detect_entities",
        python_callable=detect_entities,
        retries=1
    )

detect_files >> detect_language_task >> translate_task >> entity_detection_task