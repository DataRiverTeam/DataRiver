from airflow import DAG
from airflow.utils.trigger_rule import TriggerRule
from airflow.models.param import Param
from datariver.operators.extract_metadata import JsonExtractMetadata

import os

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'trigger_rule': TriggerRule.NONE_FAILED
}

ES_CONN_ARGS = {
    "hosts": os.environ["ELASTIC_HOST"],
    "ca_certs": "/usr/share/elasticsearch/config/certs/ca/ca.crt",
    "basic_auth": ("elastic", os.environ["ELASTIC_PASSWORD"]),
    "verify_certs": True,
}


with DAG(
    'image_workflow',
    default_args=default_args,
    schedule_interval=None,
    # REQUIRED TO RENDER TEMPLATE TO NATIVE LIST INSTEAD OF STRING!!!
    render_template_as_native_obj=True,
    params={
        "json_files_paths": Param(
            type="array",
        ),
        "fs_conn_id": Param(
            type="string",
            default="fs_data"
        ),
        "encoding": Param(
            type="string",
            default="utf-8"
        )
    },
) as dag:
    extract_metadata_task = JsonExtractMetadata(
        task_id="extract_metadata",
        json_files_paths="{{ params.json_files_paths }}",
        fs_conn_id="{{ params.fs_conn_id }}",
        input_key="image_path",
        output_key="exif",
        encoding="{{ params.encoding }}",
    )

extract_metadata_task