from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.elasticsearch.hooks.elasticsearch import ElasticsearchPythonHook
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
        hosts=["https://28e65033710b4d2e89093b2756a29c8b.us-central1.gcp.cloud.es.io"],
        es_conn_args = {"api_key":  os.environ["ELASTIC_API_KEY"]}
        )
    query = {"query": {"term": {"ride_id": "65506F830C2B492D"}}}
    result = es_hook.search(query=query, index="tripdata")
    print(result)
    return True
     
with DAG('elasticsearch_example', default_args=default_args) as dag:
    fetch_data_task = PythonOperator(
        task_id='fetch_data',
        python_callable=fetch_data_from_elasticsearch
    )

fetch_data_task