import os
from airflow import DAG
from airflow.operators.trigger_dagrun import TriggerDagRunOperator
from airflow.operators.python import PythonOperator
from airflow.models.param import Param
from datariver.operators.common.json_tools import MapJsonFile

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 1,
}


def map_paths(paths, **context):
    batch_size = context["params"]["batch_size"]

    def create_conf(paths, start_index):
        return {
            "fs_conn_id": context["params"]["fs_conn_id"],
            "json_files_paths": paths[start_index : start_index + batch_size]
        }

    clear_paths = [path for path in paths if path is not None]
    return [create_conf(clear_paths, i) for i in range(0, len(clear_paths), batch_size)]


def copy_item_to_file(item, context):
    import json
    from airflow.hooks.filesystem import FSHook
    hook = FSHook(context["params"]["fs_conn_id"])
    input_path = context["params"]["path"]

    print(item)
    dir_path = os.path.join(
        hook.get_path(),
        os.path.dirname(input_path),
        context["ti"].run_id,
    )
    os.makedirs(dir_path, exist_ok=True)
    full_path = os.path.join(
        dir_path, f'{os.path.basename(item).split(".")[0]}.json'
    )

    with open(full_path, "w") as file:
        file.write(json.dumps({"image_path": f"../{item}"}, indent=2))
    return full_path

with DAG(
    "map_file_images",
    default_args=default_args,
    schedule_interval=None,
    render_template_as_native_obj=True,
    params={
        "fs_conn_id": Param(type="string", default="fs_data"),
        "path": Param(
            type="string",
        ),
        "batch_size": Param(type="integer", default="10"),
    },
) as dag:
    map_task = MapJsonFile(
        task_id="map_json",
        fs_conn_id="{{params.fs_conn_id}}",
        path="{{params.path}}",
        python_callable=copy_item_to_file,
    )

    create_confs_task = PythonOperator(
        task_id="create_confs",
        python_callable=map_paths,
        op_kwargs={"paths": "{{ task_instance.xcom_pull(task_ids='map_json') }}"},
    )

    trigger_images_workflow_task = TriggerDagRunOperator.partial(
        task_id="trigger_images_workflow",
        trigger_dag_id="image_workflow",
    ).expand(conf=create_confs_task.output)

map_task >> create_confs_task >> trigger_images_workflow_task
