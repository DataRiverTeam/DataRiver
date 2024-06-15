from airflow import DAG
from datetime import timedelta
from datariver.sensors.filesystem import MultipleFilesSensor
from airflow.api.client.local_client import Client
from airflow.operators.python import PythonOperator
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

    detect_files = MultipleFilesSensor(
        task_id="wait_for_files",
        fs_conn_id=FS_CONN_ID,
        filepath=FILE_NAME,
        poke_interval=60,
        mode="reschedule",
        timeout=timedelta(minutes=60),
        on_success_callback = restart_dag
    )

    move_files = BashOperator(
        task_id="move_files",
        bash_command='''
            IFS="," 
            for file in $(echo "{{ ti.xcom_pull(task_ids="wait_for_files") }}" | sed -E "s/[ '[]//g" | tr -d ']');
            do
                base_dir=$(dirname "$file")
                dest="$base_dir/{{run_id}}"
                echo "moving '$file' to $dest"
                mkdir -p $dest && mv $file $dest
            done
        ''',
    )

detect_files >> move_files

