from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.elasticsearch.hooks.elasticsearch import ElasticsearchPythonHook
from elasticsearch.helpers import scan
import os

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
}

def fetch_data_from_elasticsearch():
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

    # I use scan instead of search because scan returns iterator
    for hit in scan(es_hook.get_conn, query=query, index='articles'):
        content = hit["_source"]["content"]
        doc_id = hit["_source"]["id"]
        
        file_name = os.path.join(data_dir, f"{doc_id}.txt")
        with open(file_name, "w") as file:
            file.write(content)
     
with DAG('elasticsearch_example', default_args=default_args, schedule_interval=None) as dag:
    fetch_data_task = PythonOperator(
        task_id='fetch_data',
        python_callable=fetch_data_from_elasticsearch
    )

fetch_data_task