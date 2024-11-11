from airflow import DAG
from airflow.operators.ner import NerJsonOperator1

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
}

FS_CONN_ID = "fs_data"  # id of connection defined in Airflow UI

with DAG(
    'ner_test',
    default_args=default_args,
    schedule_interval=None,
    render_template_as_native_obj=True,
) as dag:
    ner_task = NerJsonOperator1(
        task_id="ner_task",
        json_paths=[
            "airflow/data/map/manual__2024-11-10T11/output/_Dyrektywa_budyn.json"
        ]
    )

ner_task
