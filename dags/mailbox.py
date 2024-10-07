from airflow import DAG
from datetime import timedelta
from datariver.sensors.filesystem import MultipleFilesSensor
from airflow.api.client.local_client import Client
from airflow.operators.trigger_dagrun import TriggerDagRunOperator
from airflow.operators.bash import BashOperator

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
}



FS_CONN_ID = "fs_text_data"  # id of connection defined in Airflow UI
FILE_NAME = "ner/*.txt"


def restart_dag( ):
    print("restarting dag")
    import time
    time.sleep(5)
    c = Client("None", None)
    c.trigger_dag(dag_id='mailbox', conf={})


with DAG(
        'mailbox',
        default_args=default_args,
        schedule_interval=None,
        render_template_as_native_obj=True  # REQUIRED TO RENDER TEMPLATE TO NATIVE LIST INSTEAD OF STRING!!!
) as dag:

    detect_files_task = MultipleFilesSensor(
        task_id="wait_for_files",
        fs_conn_id=FS_CONN_ID,
        filepath=FILE_NAME,
        poke_interval=60,
        mode="reschedule",
        timeout=timedelta(minutes=60),
        on_success_callback = restart_dag
    )

    move_files_task = BashOperator(
        task_id="move_files",
        bash_command='''
            IFS="," 
            first="true"
            # value pulled from xcom is in format ['file_1', 'file_2']
            # sed explanation:
            # - remove [' from the begginig
            # - replace ', ' with , everywhere
            # - remove '] from the end
            for file in $(echo "{{ ti.xcom_pull(task_ids="wait_for_files") }}" | sed "s/^\['//;s/', '/,/g;s/'\]$//")
            do
                # move detected files from mailbox to folder where processing will happen
                base_dir="$(dirname "$file")"
                filename="$(basename "$file")"
                # build folder name basaed on unique run_id
                dest="$base_dir/{{run_id}}"
                mkdir -p "$dest" && mv "$file" "$dest"
                if [[ "$first" == "true" ]]; then
                    first="false"
                    echo -n "$dest/$filename"
                else
                    echo -n ",$dest/$filename"
                fi
            done
        ''',
        do_xcom_push=True
    )
    trigger_dag_task = TriggerDagRunOperator(
        task_id='trigger_dag',
        trigger_dag_id='mailbox'
    )
    trigger_ner_task = TriggerDagRunOperator(
        task_id='trigger_ner',
        trigger_dag_id='ner_workflow_parametrized',
        conf= {"files": "{{ task_instance.xcom_pull(task_ids='move_files').split(\",\") }}" }
    )

detect_files_task >> move_files_task >> trigger_dag_task >> trigger_ner_task

