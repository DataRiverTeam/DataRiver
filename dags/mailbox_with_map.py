from datetime import timedelta
import os

from airflow import DAG
from airflow.operators.trigger_dagrun import TriggerDagRunOperator
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from airflow.decorators import task_group
from airflow.models.param import Param


from datariver.operators.json import MapJsonFile
from datariver.sensors.filesystem import MultipleFilesSensor

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
}

FS_CONN_ID = "fs_text_data"  # id of connection defined in Airflow UI


def retrigger_dag():
    from airflow.api.client.local_client import Client
    print("restarting dag")
    import time
    time.sleep(5)
    c = Client("None", None)
    c.trigger_dag(dag_id='mailbox', conf={})


def copy_item_to_file(item, context):
    import json
    from airflow.hooks.filesystem import FSHook
    import datetime
    # TODO:
    #   find other way to pass some args to map function
    #   reason: creating a new hook every time you apply a function to an item
    #   might negatively affect performance
    hook = FSHook(context['params']['fs_conn_id'])

    if len(item['resultData']['results']) > 0:
        title = item['resultData']['results'][0]['title'][0:16]
        curr_date = str(datetime.datetime.now())
        dir_path = os.path.join(
            hook.get_path(),
            "map",
            context["ti"].run_id,
            "output",
        )

        os.makedirs(dir_path, exist_ok=True)

        full_path = os.path.join(
            dir_path,
            title + " " + curr_date + ".json"
        )

        with open(full_path, "w") as file:
            file.write(json.dumps(item, indent=2))

        return full_path


with DAG(
    'mailbox_',
    default_args=default_args,
    schedule_interval=None,
    render_template_as_native_obj=True,
    params={
        "fs_conn_id": Param(
            type="string",
            default="fs_data"
        ),
        "filepath": Param(
            type="string",
            default="map/*.json"
        )
    },
) as dag:

    detect_files_task = MultipleFilesSensor(
        task_id="wait_for_files",
        fs_conn_id="{{params.fs_conn_id}}",
        filepath="{{params.filepath}}",
        poke_interval=60,
        mode="reschedule",
        timeout=timedelta(minutes=60),
        on_success_callback=retrigger_dag
    )

    move_files_task = BashOperator(
        task_id="move_files",
        bash_command='''
            IFS=","
            first="true"
            for file in $(echo "{{ ti.xcom_pull(task_ids="wait_for_files") }}" | sed -E "s/[ '[]//g" | tr -d ']');
            do
                base_dir=$(dirname "$file")
                filename=$(basename "$file")
                dest="$base_dir/{{run_id}}"
                mkdir -p $dest && mv $file $dest
                if [[ $first == "true" ]]; then
                    first="false"
                    echo -n "$dest/$filename"
                else
                    echo -n ",$dest/$filename"
                fi
            done
        ''',
        do_xcom_push=True
    )

    parse_paths_task = PythonOperator(
        task_id='parse_paths',
        python_callable=lambda paths: paths.split(","),
        op_kwargs={"paths": "{{ task_instance.xcom_pull(task_ids='move_files')}}"}
    )

    trigger_dag_task = TriggerDagRunOperator(
        task_id='trigger_dag',
        trigger_dag_id='mailbox'
    )

    @task_group(
        group_id='process_file',
        params={"fs_conn_id": "{{params.fs_conn_id}}"}
    )
    def process_file(path, params=None):
        # FIXME - list of file paths contains None values,
        #   because items in test file don't necessarily contain any articles
        #
        # TODO - item in the file might include multiple articles;
        #   maybe we should use the FlatMap operation instead of Map?
        #   (this could also fix the issue above)
        map_task = MapJsonFile(
            task_id="map_json",
            fs_conn_id="{{params.fs_conn_id}}",
            # path="{{params.file}}",
            path=path,
            python_callable=copy_item_to_file
        )

        trigger_ner_task = TriggerDagRunOperator(
            task_id='trigger_ner',
            trigger_dag_id='ner_workflow_parametrized',
            conf={
                "fs_conn_id": "{{params.fs_conn_id}}",
                "path": "{{task_instance.xcom_pull(task_ids='map_json')}}",
            }
        )

        map_task >> trigger_ner_task

    files_pipeline = process_file.expand(path=parse_paths_task.output)

detect_files_task >> move_files_task >> parse_paths_task >> [files_pipeline, trigger_dag_task]
