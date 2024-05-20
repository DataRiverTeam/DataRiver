from airflow import DAG
from airflow.operators.python import PythonOperator, PythonVirtualenvOperator
from airflow.providers.elasticsearch.hooks.elasticsearch import ElasticsearchPythonHook
from elasticsearch.helpers import scan
from elasticsearch import Elasticsearch
import os
from typing import Dict

from datetime import timedelta
from datariver.sensors.filesystem import MultipleFilesSensor

from datariver.operators.langdetect import LangdetectOperator
from datariver.operators.translate import DeepTranslatorOperator
from datariver.operators.ner import NerOperator
from datariver.operators.elasticsearch import EntitydetectOperator



def detect_entities(ti):
    import spacy    
    import nltk

    nltk.download("punkt")  # download sentence tokenizer used for splitting text to sentences
    # files = ti.xcom_pull(key="return_value", task_ids="wait_for_files")
    files = ti.xcom_pull(key="return_value", task_ids="translate")

    es = Elasticsearch(
        os.environ["ELASTIC_HOST"],
        api_key=os.environ["ELASTIC_API_KEY"],
        timeout=60
    )
    # delete index named-entities; TODO: change this in future
    es.options(ignore_status=[400,404]).indices.delete(index='named-entities')
    document = {}
    nlp = spacy.load("en_core_web_md")
    for file in files:
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

    detect_files = MultipleFilesSensor(
        task_id="wait_for_files",
        fs_conn_id=FS_CONN_ID,
        filepath=FILE_NAME,
        poke_interval=60,
        mode="reschedule",
        timeout=timedelta(minutes=60),
    )

    # detect_language_task = LangdetectOperator(
    #     task_id="detect_language",
    #     files="{{task_instance.xcom_pull('wait_for_files')}}"
    # )

    # translate_task = PythonOperator(
    #     task_id='translate',
    #     python_callable=translate,
    # )

    translate_task = DeepTranslatorOperator(
        task_id="translate",
        files="{{task_instance.xcom_pull('wait_for_files')}}",
        fs_conn_id=FS_CONN_ID,
        output_dir="ner/translated/",
        output_language="en"
    )

    ner_task = NerOperator.partial(
        task_id="detect_entities",
        model="en_core_web_md"
    ).expand(path=detect_files.output)      # .output lets us fetch the return_value of previously executed Operator

    entity_detection_task = EntitydetectOperator(
         task_id="detect_entities",
         files="{{task_instance.xcom_pull('wait_for_files')}}",
         fs_conn_id=FS_CONN_ID,
     )

detect_files >> detect_language_task >> translate_task >> entity_detection_task


#detect_files >> translate_task >> ner_task
