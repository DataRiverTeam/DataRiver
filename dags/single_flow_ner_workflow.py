from airflow import DAG

from airflow.operators.python import PythonOperator
from airflow.exceptions import AirflowConfigException
from airflow.models.param import Param
from datariver.operators.translate import SingleFileTranslatorOperator
from datariver.operators.ner import NerJsonOperator
from datariver.operators.elasticsearch import ElasticPushOperator, ElasticSearchOperator
from datariver.operators.stats import NerJsonStatisticsOperator
from datariver.operators.collectstats import JsonSummaryMarkdownOperator

import os

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
}


FS_CONN_ID = "fs_text_data"  # id of connection defined in Airflow UI
FILE_NAME = "ner/*.txt"
ES_CONN_ARGS = {
    "hosts": os.environ["ELASTIC_HOST"],
    "ca_certs": "/usr/share/elasticsearch/config/certs/ca/ca.crt",
    "basic_auth": ("elastic", os.environ["ELASTIC_PASSWORD"]),
    "verify_certs": True,
}
#file_path can be renamed to json_file path to improve code readability
def validate_params(**context):
    if "params" not in context or "file_path" not in context["params"] or "fs_conn_id" not in context["params"]:
        raise AirflowConfigException("No params defined")

with DAG(
        'single_flow_ner_workflow',
        default_args=default_args,
        schedule_interval=None,
        render_template_as_native_obj=True,  # REQUIRED TO RENDER TEMPLATE TO NATIVE LIST INSTEAD OF STRING!!!
        params={
            "file_path": Param(
                type="string",
            ),
            "fs_conn_id": Param(
                type="string",
                default="fs_default"
            )
        },
) as dag:
    validate_params_task = PythonOperator(
        task_id="validate_params",
        python_callable=validate_params
    )

    translate_task = SingleFileTranslatorOperator(
        task_id="translate",
        json_path="{{params.file_path}}",
        fs_conn_id="{{params.fs_conn_id}}",
        input_key="content",
        output_key="translated",
        output_language="en"
    )

    ner_task = NerJsonOperator(
        task_id="detect_entities",
        model="en_core_web_md",
        fs_conn_id="{{params.fs_conn_id}}",
        json_path="{{params.file_path}}",
        input_key="translated",
        output_key="ner"
    )

    es_push_task = ElasticPushOperator(
        task_id="elastic_push",
        fs_conn_id="{{params.fs_conn_id}}",
        index="ner",
        document={},
        es_conn_args=ES_CONN_ARGS,
        pre_execute = lambda self: setattr(self["task"],"document",{"document": list(self["task_instance"].xcom_pull("detect_entities"))}),
    )

    stats_task = NerJsonStatisticsOperator(
        task_id="generate_stats",
        json_path="{{params.file_path}}",
        fs_conn_id="{{params.fs_conn_id}}",
        input_key="ner",
        output_key="ner_stats",
    )

    es_search_task = ElasticSearchOperator(
        task_id="elastic_get",
        fs_conn_id="{{params.fs_conn_id}}",
        index="ner",
        query={"match_all": {}},
        es_conn_args=ES_CONN_ARGS,
    )


    summary_task = JsonSummaryMarkdownOperator(
        task_id="summary",
        summary_filename="summary.md",
        output_dir='{{ "/".join(params["file_path"].split("/")[:-1] + ["summary"])}}',
        fs_conn_id="{{params.fs_conn_id}}",

        # this method works too, might be useful if we pull data with different xcom keys
        # stats="[{{task_instance.xcom_pull(task_ids = 'generate_stats', key = 'stats')}}, {{task_instance.xcom_pull(task_ids = 'translate', key = 'stats')}}]"

        json_path="{{params.file_path}}",
        input_key="ner_stats",
    )

validate_params_task >> translate_task >> ner_task >> stats_task >> summary_task >> es_push_task >> es_search_task