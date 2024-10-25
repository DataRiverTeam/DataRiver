from airflow import DAG

from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.utils.trigger_rule import TriggerRule
from airflow.exceptions import AirflowConfigException
from airflow.models.param import Param
from datariver.operators.json_tools import JsonArgs
from datariver.operators.langdetect import JsonLangdetectOperator
from datariver.operators.translate import JsonTranslateOperator
from datariver.operators.ner import NerJsonOperator
from datariver.operators.elasticsearch import ElasticJsonPushOperator, ElasticSearchOperator
from datariver.operators.stats import NerJsonStatisticsOperator
from datariver.operators.collectstats import JsonSummaryMarkdownOperator

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


def validate_params(**context):
    if "params" not in context or "json_file_path" not in context["params"] or "fs_conn_id" not in context["params"]:
        raise AirflowConfigException("No params defined")


def decide_about_translation(**context):
    json_args = JsonArgs(
        context["params"]["fs_conn_id"],
        context["params"]["json_file_path"]
    )
    language = json_args.get_value("language")
    if language != "en":
        return "translate"
    return "detect_entities_without_translation"


with DAG(
    'ner_single_file',
    default_args=default_args,
    schedule_interval=None,
    # REQUIRED TO RENDER TEMPLATE TO NATIVE LIST INSTEAD OF STRING!!!
    render_template_as_native_obj=True,
    params={
        "json_file_path": Param(
            type="string",
        ),
        "fs_conn_id": Param(
            type="string",
            default="fs_data"
        )
    },
) as dag:
    validate_params_task = PythonOperator(
        task_id="validate_params",
        python_callable=validate_params
    )

    detect_language_task = JsonLangdetectOperator(
        task_id="detect_language",
        json_file_path="{{params.json_file_path}}",
        fs_conn_id="{{params.fs_conn_id}}",
        input_key="content",
        output_key="language",
    )

    decide_about_translation = BranchPythonOperator(
        task_id="branch",
        python_callable=decide_about_translation
    )

    translate_task = JsonTranslateOperator(
        task_id="translate",
        json_file_path="{{params.json_file_path}}",
        fs_conn_id="{{params.fs_conn_id}}",
        input_key="content",
        output_key="translated",
        output_language="en"
    )

    ner_task = NerJsonOperator(
        task_id="detect_entities",
        model="en_core_web_md",
        fs_conn_id="{{params.fs_conn_id}}",
        json_file_path="{{params.json_file_path}}",
        input_key="translated",
        output_key="ner",
        trigger_rule=TriggerRule.NONE_FAILED_OR_SKIPPED
    )

    ner_without_translation_task = NerJsonOperator(
        task_id="detect_entities_without_translation",
        model="en_core_web_md",
        fs_conn_id="{{params.fs_conn_id}}",
        json_file_path="{{params.json_file_path}}",
        input_key="content",
        output_key="ner"
    )

    es_push_task = ElasticJsonPushOperator(
        task_id="elastic_push",
        fs_conn_id="{{params.fs_conn_id}}",
        json_file_path="{{params.json_file_path}}",
        index="ner",
        es_conn_args=ES_CONN_ARGS,
    )

    stats_task = NerJsonStatisticsOperator(
        task_id="generate_stats",
        json_file_path="{{params.json_file_path}}",
        fs_conn_id="{{params.fs_conn_id}}",
        input_key="ner",
        output_key="ner_stats",
    )

    es_search_task = ElasticSearchOperator(
        task_id="elastic_get",
        index="ner",
        query={"term": {"_id": "{{task_instance.xcom_pull('elastic_push')['_id']}}"}},
        es_conn_args=ES_CONN_ARGS,
    )

    summary_task = JsonSummaryMarkdownOperator(
        task_id="summary",
        summary_filename='{{ params.json_file_path.replace(".json",".md") }}',
        fs_conn_id="{{params.fs_conn_id}}",

        # this method works too, might be useful if we pull data with different xcom keys
        # stats="[{{task_instance.xcom_pull(task_ids = 'generate_stats', key = 'stats')}}, {{task_instance.xcom_pull(task_ids = 'translate', key = 'stats')}}]"

        json_file_path="{{params.json_file_path}}",
        input_key="ner_stats",
    )

validate_params_task >> detect_language_task >> decide_about_translation >> [translate_task, ner_without_translation_task]
translate_task >> ner_task
[ner_without_translation_task, ner_task] >> stats_task >> summary_task >> es_push_task >> es_search_task
