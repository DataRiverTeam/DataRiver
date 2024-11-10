from airflow import DAG
from airflow.utils.trigger_rule import TriggerRule
from airflow.models.param import Param
from datariver.operators.images.perceptual_hash import JsonPerceptualHash
from datariver.operators.images.descript_image import JsonDescribeImage
from datariver.operators.common.elasticsearch import (
    ElasticJsonPushOperator,
    ElasticSearchOperator,
)
import os

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
    perceptual_hash_task = JsonPerceptualHash(
        task_id="perceptual_hash",
        json_files_paths="{{ params.json_files_paths }}",
        fs_conn_id="{{ params.fs_conn_id }}",
        input_key="image_path",
        output_key="hash",
    )
    descript_image_task = JsonDescribeImage(
        task_id="descript_image",
        json_files_paths="{{ params.json_files_paths }}",
        fs_conn_id="{{ params.fs_conn_id }}",
        input_key="image_path",
        output_key="description",
    )
    es_push_task = ElasticJsonPushOperator(
        task_id="elastic_push",
        fs_conn_id="{{ params.fs_conn_id }}",
        json_files_paths="{{ params.json_files_paths }}",
        index="image_processing",
        es_conn_args=ES_CONN_ARGS,
        error_key="error",
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
    )

[perceptual_hash_task, descript_image_task] >> es_push_task >> es_search_task
