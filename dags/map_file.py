import os

from airflow import DAG
from airflow.operators.trigger_dagrun import TriggerDagRunOperator
from airflow.operators.python import PythonOperator
from airflow.models.param import Param


from datariver.operators.json import MapJsonFile

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
}


def map_paths(paths, batch_size, **context):
    def create_conf(paths, start_index):
        return {
            "fs_conn_id": context['params']['fs_conn_id'],
            "json_file_path": paths[start_index:start_index+batch_size],
        }
    clear_paths = [path for path in paths if path is not None]
    return [create_conf(clear_paths, i) for i in range(0, len(clear_paths), batch_size)]


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
        article = item['resultData']['results'][0]
        title = article['title']
        content = article["content"]
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
            f'{title[:16].replace(" ", "_")}_{curr_date}.json'
        )

        with open(full_path, "w") as file:
            file.write(
                json.dumps(
                    {"title": title, "content": content},
                    indent=2
                )
            )

        return full_path


with DAG(
    'map_file',
    default_args=default_args,
    schedule_interval=None,
    render_template_as_native_obj=True,
    params={
        "fs_conn_id": Param(
            type="string",
            default="fs_data"
        ),
        "path": Param(
            type="string",
        ),
        "batch_size": Param(
            type="integer",
            default="10"
        )
    },
) as dag:
    # FIXME - list of file paths contains None values,
    #   because items in test file don't necessarily contain any articles
    #
    # TODO - item in the file might include multiple articles;
    #   maybe we should use the FlatMap operation instead of Map?
    #   (this could also fix the issue above)
    map_task = MapJsonFile(
        task_id="map_json",
        fs_conn_id="{{params.fs_conn_id}}",
        path="{{params.path}}",
        python_callable=copy_item_to_file
    )

    create_confs_task = PythonOperator(
        task_id="create_confs",
        python_callable=map_paths,
        op_kwargs={
            "paths": "{{ task_instance.xcom_pull(task_ids='map_json') }}",
            "batch_size": "{{ params.batch_size }}"
        }
    )

    trigger_ner_task = TriggerDagRunOperator.partial(
        task_id='trigger_ner',
        trigger_dag_id='ner_single_file',
    ).expand(conf=create_confs_task.output)

map_task >> create_confs_task >> trigger_ner_task
