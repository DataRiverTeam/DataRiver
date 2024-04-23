from airflow import DAG
from airflow.operators.python import PythonOperator, PythonVirtualenvOperator
from airflow.providers.elasticsearch.hooks.elasticsearch import ElasticsearchPythonHook
from elasticsearch.helpers import scan
import os
from typing import Dict

def fetch_data_from_elasticsearch(ti):
    print(os.environ["ELASTIC_API_KEY"])
    es_hook = ElasticsearchPythonHook(
        hosts=[os.environ["ELASTIC_HOST"]],
        es_conn_args = {"api_key":  os.environ["ELASTIC_API_KEY"]}
        )
    query = { "query": {"match_all": {}}, "_source": ["content", "id"] }
    data_dir = "data"
    try:
        os.mkdir(data_dir)
    except FileExistsError:
        pass
    files: list[str] = []
    # I use scan instead of search because scan returns iterator
    for hit in scan(es_hook.get_conn, query=query, index='articles'):
        content = hit["_source"]["content"]
        doc_id = hit["_source"]["id"] 
        file_path = os.path.join(data_dir, f"{doc_id}.txt")
        files.append(file_path)
        with open(file_path, "w") as file:
            file.write(content)
    ti.xcom_push(key="files", value=files)

# Task expects list of strings containing file names.
# It opens every file from the list, performs language detection and groups the files based on detected language
# def detect_language(files: list[str]):
def detect_language(ti):
    import langdetect
    files = ti.xcom_pull(key="files", task_ids="fetch_data")
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



MAX_FRAGMENT_LENGTH = 500


# Task translates text files, based on received dict from "detect_languages".
def translate(ti):
    from translate import Translator
    from os import rename
    import nltk

    langs: Dict[str, list[str]] = ti.xcom_pull(key="langs", task_ids="detect_language")
    
    nltk.download("punkt")  # download sentence tokenizer used for splitting text to sentences

    for lang in langs:
        if lang == "en":
            continue
        translator= Translator(from_lang=lang, to_lang="en")    # we should use differen't tokenizers     
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
                    sentences = nltk.tokenize.sent_tokenize(text, "english")        # FIXME: we shouldn't use English tokenizer for every language!

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
                pass


def detect_entities(ti):
    # from io import BytesIO
    # from minio import Minio
    import spacy    
    import nltk

    nltk.download("punkt")  # download sentence tokenizer used for splitting text to sentences
    files = ti.xcom_pull(key="files", task_ids="fetch_data")
    # in case we want to download data from cloud storage
    # client = Minio(
    #     minio_url,
    #     access_key=minio_access_key,
    #     secret_key=minio_secret_key,
    #     secure=False
    # )
    for file in files:
        # in case we download file for Airflow cluster node from MinIO
        # response = client.fget_object("airflow-bucket", download_dir + file, download_path)
        nlp = spacy.load("en_core_web_md")
        try:
            with open(file, "r") as f: 

                text = f.read()
                sentences = nltk.tokenize.sent_tokenize(text, "english")
                
                for s in sentences:
                    doc = nlp(s)
                    # ent - named entity detected by nlp
                    # ent.label_ - label assigned to text fragment (e.g. Google -> Company, 30 -> Cardinal)
                    # ent.sent - sentence including given entity
                    for ent in doc.ents:
                        # print(ent.text + " | " + str(ent.label_) + " | " + str(ent.sent))
                        pass

                    
                # TODO:
                # pass data from this task further, so we can store it in database
                # suggestion:
                # if we are not going to pass data to cloud storage, 
                # we can create Python dict using structure like this:
                # {
                #   "filename1": {
                #       "sentence1": [
                #           {text: "...", "label": "..."},
                #           {text: "...", "label": "..."},
                #            ...
                #       ],
                #       "sentence2": [
                #           {text: "...", "label": "..."},
                #            ...
                #       ]
                #   },
                #   "filename2": {
                #       ...
                #   }
                # }
                #
                # Alternatively we can refrain from including file names as keys, depending on what we are going to store in database later
        except IOError:
            raise Exception("Given file doesn't exist!")
    
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
}
with DAG('elasticsearch_example', default_args=default_args, schedule_interval=None) as dag:
    fetch_data_task = PythonOperator(
        task_id='fetch_data',
        python_callable=fetch_data_from_elasticsearch
    )
    detect_language_task = PythonOperator(
        task_id='detect_language',
        python_callable=detect_language,
        # op_kwargs={"text": example_text}
        # op_kwargs={"files": []}
    )
    translate_task = PythonOperator(
        task_id='translate',
        python_callable=translate,
    )
    # We can't use PythonVirtualenvOperator, because it's not possible to pass Task instance data to isolated environment.
    # Because of this, for now, we are forced to install requiremed modules globally,
    # OR
    # Launch DAG for each file separately, and perhaps store file name retrieved from some FileSensor
    
    # translate_task = PythonVirtualenvOperator(
    #     task_id='translate',
    #     python_callable=translate,
    #     requirements=["translate==3.6.1"],
    #     system_site_packages=False,
    # )

    entity_detection_task = PythonOperator(
        task_id="detect_entities",
        python_callable=detect_entities,
    )
fetch_data_task >> detect_language_task >> translate_task >> entity_detection_task