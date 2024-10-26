from datetime import timedelta

from airflow import DAG
from airflow.operators.trigger_dagrun import TriggerDagRunOperator
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from airflow.models.param import Param
from datariver.sensors.filesystem import MultipleFilesSensor

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
}

FS_CONN_ID = "fs_data"  # id of connection defined in Airflow UI


def parse_paths(paths, batch_size):
    def create_conf(path):
        return {
            "path": path,
            "batch_size": int(batch_size)
        }

    paths_list = paths.split(",")

    return list(map(create_conf, paths_list))


with DAG(
    'mailbox',
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
        ),
        "batch_size": Param(
            type="integer",
            default=10
        )
    },
) as dag:
    detect_files_task = MultipleFilesSensor(
        task_id="wait_for_files",
        fs_conn_id="{{params.fs_conn_id}}",
        filepath="{{params.filepath}}",
        poke_interval=60,
        mode="reschedule",
        timeout=timedelta(minutes=60)
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

    parse_paths_task = PythonOperator(
        task_id='parse_paths',
        python_callable=parse_paths,
        op_kwargs={
            "paths": "{{ task_instance.xcom_pull(task_ids='move_files')}}",
            "batch_size": "{{ params.batch_size }}"
        }
    )

    trigger_map_file_task = TriggerDagRunOperator.partial(
        task_id='trigger_map_file',
        trigger_dag_id='map_file'
    ).expand(conf=parse_paths_task.output)

    trigger_mailbox = TriggerDagRunOperator(
        task_id='trigger_mailbox',
        trigger_dag_id='mailbox',
        conf="{{ params }}" # noqa
    )


detect_files_task >> move_files_task >> parse_paths_task >> trigger_map_file_task >> trigger_mailbox
