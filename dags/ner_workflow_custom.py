from airflow import DAG

from datetime import timedelta
from datariver.sensors.filesystem import MultipleFilesSensor

from datariver.operators.translate import DeepTranslatorOperator
from datariver.operators.ner import NerOperator

    
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
}

def get_translated_path(path):
    parts = path.split("/")
    if len(parts) < 1:
        return path
    return  "/".join(parts[:-1]+["translated"] + parts[-1:])

FS_CONN_ID = "fs_text_data"    #id of connection defined in Airflow UI
FILE_NAME = "ner/*.txt"


with DAG(
    'ner_workflow_custom',
    default_args=default_args,
    schedule_interval=None,
    render_template_as_native_obj=True      # REQUIRED TO RENDER TEMPLATE TO NATIVE LIST INSTEAD OF STRING!!!
) as dag:

    detect_files = MultipleFilesSensor(
        task_id="wait_for_files",
        fs_conn_id=FS_CONN_ID,
        filepath=FILE_NAME,
        poke_interval=60,
        mode="reschedule",
        timeout=timedelta(minutes=60),
    )

    translate_task = DeepTranslatorOperator(
        task_id="translate",
        files="{{task_instance.xcom_pull('wait_for_files')}}",
        fs_conn_id=FS_CONN_ID,
        output_dir="ner/translated/",
        output_language="en"
    )

    ner_task = NerOperator.partial(
        task_id="detect_entities",
        model="en_core_web_md",
        fs_conn_id=FS_CONN_ID
    ).expand(path=detect_files.output.map(get_translated_path))      # .output lets us fetch the return_value of previously executed Operator


detect_files >> translate_task >> ner_task