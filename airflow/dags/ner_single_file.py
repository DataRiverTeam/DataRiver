from airflow import DAG

from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.utils.trigger_rule import TriggerRule
from airflow.models.param import Param
from datariver.operators.common.exception_managing import ErrorHandler
from datariver.operators.common.json_tools import JsonArgs
from datariver.operators.common.elasticsearch import (
    ElasticJsonPushOperator,
    ElasticSearchOperator,
)
from datariver.operators.texts.langdetect import JsonLangdetectOperator
from datariver.operators.texts.translate import JsonTranslateOperator
from datariver.operators.texts.ner import NerJsonOperator
from datariver.operators.texts.stats import NerJsonStatisticsOperator
from datariver.operators.texts.collectstats import JsonSummaryMarkdownOperator

import os
import datetime

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


def _filter_errors(context, exclude):
    task = context["task"]
    task_id = context["task_instance"].task_id
    result = [
        json_file
        for json_file in task.json_files_paths
        if exclude
        == ErrorHandler(
            json_file, task.fs_conn_id, task.error_key, task_id, task.encoding
        ).is_file_error_free()
    ]
    setattr(context["task"], "json_files_paths", result)


def filter_errors(context):
    _filter_errors(context, True)


def get_errors(context):
    _filter_errors(context, False)


def decide_about_translation(ti, **context):
    fs_conn_id = context["params"]["fs_conn_id"]
    json_files_paths = context["params"]["json_files_paths"]
    translation = []
    no_translation = []
    for file_path in json_files_paths:
        json_args = JsonArgs(fs_conn_id, file_path)
        language = json_args.get_value("language")
        if language != "en":
            translation.append(file_path)
        else:
            no_translation.append(file_path)

    branches = []
    if len(translation) > 0:
        branches.append("translate")
        ti.xcom_push(key="json_files_paths_translation", value=translation)
    if len(no_translation) > 0:
        branches.append("detect_entities_without_translation")
        ti.xcom_push(key="json_files_paths_no_translation", value=no_translation)
    return branches


def add_pre_run_information(**context):
    fs_conn_id = context["params"]["fs_conn_id"]
    json_files_paths = context["params"]["json_files_paths"]
    date = datetime.datetime.now().replace(microsecond=0).isoformat()
    run_id = context["dag_run"].run_id
    for file_path in json_files_paths:
        json_args = JsonArgs(fs_conn_id, file_path)
        json_args.add_value("dag_start_date", date)
        json_args.add_value("dag_run_id", run_id)


def add_post_run_information(**context):
    fs_conn_id = context["params"]["fs_conn_id"]
    json_files_paths = context["params"]["json_files_paths"]
    date = datetime.datetime.now().replace(microsecond=0).isoformat()
    for file_path in json_files_paths:
        json_args = JsonArgs(fs_conn_id, file_path)
        json_args.add_value("dag_processed_date", date)


with DAG(
    "ner_single_file",
    default_args=default_args,
    schedule_interval=None,
    # REQUIRED TO RENDER TEMPLATE TO NATIVE LIST INSTEAD OF STRING!!!
    render_template_as_native_obj=True,
    params={
        "json_files_paths": Param(
            type="array",
        ),
        "fs_conn_id": Param(type="string", default="fs_data"),
        "encoding": Param(type="string", default="utf-8"),
    },
) as dag:
    add_pre_run_information_task = PythonOperator(
        task_id="add_pre_run_information",
        python_callable=add_pre_run_information,
        provide_context=True,
    )

    detect_language_task = JsonLangdetectOperator(
        task_id="detect_language",
        json_files_paths="{{ params.json_files_paths }}",
        fs_conn_id="{{ params.fs_conn_id }}",
        input_key="content",
        output_key="language",
        encoding="{{ params.encoding }}",
        error_key="error",
    )

    decide_about_translation = BranchPythonOperator(
        task_id="branch", python_callable=decide_about_translation, provide_context=True
    )

    translate_task = JsonTranslateOperator(
        task_id="translate",
        json_files_paths='{{ ti.xcom_pull(task_ids="branch", key="json_files_paths_translation") }}',
        fs_conn_id="{{ params.fs_conn_id }}",
        input_key="content",
        output_key="translated",
        output_language="en",
        encoding="{{ params.encoding }}",
        error_key="error",
    )

    ner_task = NerJsonOperator(
        task_id="detect_entities",
        model="en_core_web_md",
        fs_conn_id="{{params.fs_conn_id}}",
        json_files_paths='{{ ti.xcom_pull(task_ids="branch", key="json_files_paths_translation") }}',
        input_key="translated",
        output_key="ner",
        trigger_rule=TriggerRule.NONE_FAILED_OR_SKIPPED,
        encoding="{{ params.encoding }}",
        error_key="error",
    )

    ner_without_translation_task = NerJsonOperator(
        task_id="detect_entities_without_translation",
        model="en_core_web_md",
        fs_conn_id="{{ params.fs_conn_id }}",
        json_files_paths='{{ ti.xcom_pull(task_ids="branch", key="json_files_paths_no_translation") }}',
        input_key="content",
        output_key="ner",
        encoding="{{ params.encoding }}",
        error_key="error",
    )

    stats_task = NerJsonStatisticsOperator(
        task_id="generate_stats",
        json_files_paths="{{ params.json_files_paths }}",
        fs_conn_id="{{ params.fs_conn_id }}",
        input_key="ner",
        output_key="ner_stats",
        encoding="{{ params.encoding }}",
        error_key="error",
    )

    summary_task = JsonSummaryMarkdownOperator(
        task_id="summary",
        summary_filenames='{{ params.json_files_paths|replace(".json",".md") }}',
        fs_conn_id="{{params.fs_conn_id}}",
        # this method works too, might be useful if we pull data with different xcom keys
        # stats="[{{task_instance.xcom_pull(task_ids = 'generate_stats', key = 'stats')}}, {{task_instance.xcom_pull(task_ids = 'translate', key = 'stats')}}]"
        json_files_paths="{{ params.json_files_paths }}",
        input_key="ner_stats",
        encoding="{{ params.encoding }}",
        error_key="error",
    )

    add_post_run_information_task = PythonOperator(
        task_id="add_post_run_information",
        python_callable=add_post_run_information,
        provide_context=True,
    )

    es_push_task = ElasticJsonPushOperator(
        task_id="elastic_push",
        fs_conn_id="{{ params.fs_conn_id }}",
        json_files_paths="{{ params.json_files_paths }}",
        index="ner",
        es_conn_args=ES_CONN_ARGS,
        encoding="{{ params.encoding }}",
        error_key="error",
        pre_execute=filter_errors,
    )

    error_push_task = ElasticJsonPushOperator(
        task_id="elastic_error_push",
        fs_conn_id="{{ params.fs_conn_id }}",
        json_files_paths="{{ params.json_files_paths }}",
        index="errors",
        es_conn_args=ES_CONN_ARGS,
        encoding="{{ params.encoding }}",
        error_key="error",
        pre_execute=get_errors,
    )

    es_search_task = ElasticSearchOperator(
        task_id="elastic_get",
        index="ner",
        query={
            "terms": {
                "_id": "{{ task_instance.xcom_pull('elastic_push') | selectattr('_id') | list }}"
            }
        },
        es_conn_args=ES_CONN_ARGS,
    )

(
    add_pre_run_information_task
    >> detect_language_task
    >> decide_about_translation
    >> [translate_task, ner_without_translation_task]
)
translate_task >> ner_task
(
    [ner_without_translation_task, ner_task]
    >> stats_task
    >> summary_task
    >> add_post_run_information_task
    >> es_push_task
    >> error_push_task
    >> es_search_task
)
