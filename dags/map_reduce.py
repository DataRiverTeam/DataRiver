from airflow import DAG

from airflow.operators.python import PythonOperator
from airflow.exceptions import AirflowConfigException
from airflow.models.param import Param

from datariver.operators.translate import DeepTranslatorOperator
from datariver.operators.json import MapJsonFile


import os

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
}

FS_DATA_CONN = "fs_data"
FILE_PATH = "teksty.json"

with DAG(
    'map_reduce',
    default_args=default_args,
    schedule_interval=None,
    render_template_as_native_obj=True,
    params={
        "file": Param(
            type="string",
        ),
        "fs_conn_id": Param(
            type="string",
            default="fs_default"
        )
    },
) as dag:

    def map_fun(item, context):
        import json
        from airflow.hooks.filesystem import FSHook
        import datetime

        hook = FSHook(context['params']['fs_conn_id'])

        if len(item['resultData']['results']) > 0:
            title = item['resultData']['results'][0]['title'][0:24]
            curr_date = str(datetime.datetime.now())
            full_path = os.path.join(
                hook.get_path(),
                title + " " + curr_date + ".json"
            )

            print(full_path)

            with open(full_path, "w") as file:
                file.write(json.dumps(item, indent=2))

            return 1

    map_task = MapJsonFile(
        task_id="map_json",
        # fs_conn_id="{{params.fs_conn_id}}",
        fs_conn_id="fs_data",
        path="{{params.file}}",
        python_callable=map_fun
    )

map_task
