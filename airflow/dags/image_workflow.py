from airflow import DAG
from airflow.utils.trigger_rule import TriggerRule
from airflow.operators.python import PythonOperator
from airflow.models.param import Param
from datariver.operators.images.perceptual_hash import JsonPerceptualHash
from datariver.operators.images.describe_image import JsonDescribeImage
from datariver.operators.images.thumbnail import JsonThumbnailImage
from datariver.operators.images.extract_metadata import JsonExtractMetadata
from datariver.operators.common.json_tools import (
    add_pre_run_information,
    add_post_run_information,
)
from datariver.operators.common.elasticsearch import (
    ElasticSearchOperator,
    ElasticJsonUpdateOperator,
)
import os
import shutil

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 1,
    "trigger_rule": TriggerRule.NONE_FAILED,
}

ES_CONN_ARGS = {
    "hosts": os.environ["ELASTIC_HOST"],
    "ca_certs": "/usr/share/elasticsearch/config/certs/ca/ca.crt",
    "basic_auth": ("elastic", os.environ["ELASTIC_PASSWORD"]),
    "verify_certs": True,
}


def remove_temp_files(context, result):
    json_files_paths = context["params"]["json_files_paths"]
    if (len(json_files_paths)) != 0:
        dirname = os.path.dirname(json_files_paths[0])
        shutil.rmtree(dirname)


with DAG(
    "image_workflow",
    default_args=default_args,
    schedule_interval=None,
    # REQUIRED TO RENDER TEMPLATE TO NATIVE LIST INSTEAD OF STRING!!!
    render_template_as_native_obj=True,
    params={
        "json_files_paths": Param(
            type="array",
        ),
        "fs_conn_id": Param(type="string", default="fs_data"),
    },
) as dag:
    add_pre_run_information_task = PythonOperator(
        task_id="add_pre_run_information",
        python_callable=add_pre_run_information,
        provide_context=True,
    )
    perceptual_hash_task = JsonPerceptualHash(
        task_id="perceptual_hash",
        json_files_paths="{{ params.json_files_paths }}",
        fs_conn_id="{{ params.fs_conn_id }}",
        input_key="image_path",
        output_key="hash",
    )
    extract_metadata_task = JsonExtractMetadata(
        task_id="extract_metadata",
        json_files_paths="{{ params.json_files_paths }}",
        fs_conn_id="{{ params.fs_conn_id }}",
        input_key="image_path",
        output_key="metadata",
    )
    thumbnail_task = JsonThumbnailImage(
        task_id="thumbnail",
        json_files_paths="{{ params.json_files_paths }}",
        fs_conn_id="{{ params.fs_conn_id }}",
        input_key="image_path",
        output_key="thumbnail",
    )
    describe_image_task = JsonDescribeImage(
        task_id="describe_image",
        json_files_paths="{{ params.json_files_paths }}",
        fs_conn_id="{{ params.fs_conn_id }}",
        input_key="image_path",
        output_key="description",
        local_model_path="/home/airflow/.local/BLIP",
    )
    add_post_run_information_task = PythonOperator(
        task_id="add_post_run_information",
        python_callable=add_post_run_information,
        provide_context=True,
    )
    es_update_task = ElasticJsonUpdateOperator(
        task_id="elastic_update",
        fs_conn_id="{{ params.fs_conn_id }}",
        json_files_paths="{{ params.json_files_paths }}",
        index="image_processing",
        es_conn_args=ES_CONN_ARGS,
    )
    es_search_task = ElasticSearchOperator(
        task_id="elastic_get",
        index="image_processing",
        query={
            "terms": {
                "_id": "{{ task_instance.xcom_pull('elastic_push') | selectattr('_id') | list }}"
            }
        },
        es_conn_args=ES_CONN_ARGS,
        post_execute=remove_temp_files,
    )

(
    add_pre_run_information_task
    >> [
        thumbnail_task,
        perceptual_hash_task,
        describe_image_task,
        extract_metadata_task,
    ]
    >> add_post_run_information_task
    >> es_update_task
    >> es_search_task
)
