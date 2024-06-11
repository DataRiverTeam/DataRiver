from airflow import DAG
import os

from datariver.operators.elastic_push import ElasticPushOperator

print("host: ",os.environ["ELASTIC_HOST"])


default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
}

with DAG('sandbox', default_args=default_args, schedule_interval=None) as dag:
    push_task = ElasticPushOperator(
        task_id='push',
        index="new_index",
        document={"field": "xD"}
        # op_kwargs={"text": example_text}
        # op_kwargs={"files": []}
    )


push_task