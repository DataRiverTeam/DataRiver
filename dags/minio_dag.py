from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.amazon.aws.sensors.s3 import S3KeySensor
# Needed to import airflow variables defined in http://.../variable/list/
from airflow.models import Variable


minio_url = Variable.get("minio_api_url")               # variables are defined through Airflow panel
minio_access_key = Variable.get('minio_access_key') 
minio_secret_key = Variable.get('minio_secret_key')

def recognize_entities():
    from io import BytesIO
    from minio import Minio

    client = Minio(
        minio_url,
        access_key=minio_access_key,
        secret_key=minio_secret_key,
        secure=False
    )

    try:
        # second argument - object_name, perhaps should be passed from previous tasks
        response = client.get_object("airflow-bucket", "data.csv")
        # Read data from response.
        print(response.data.decode("utf-8"))
    finally:
        response.close()
        response.release_conn()
    

with DAG(
    dag_id="minio_test",
    default_args={
        "depends_on_past": False,
        "email": ["airflow@example.com"],
        "email_on_failure": False,
        "email_on_retry": False,
        # "retries": 1,
        # "retry_delay": timedelta(minutes=5),
    },
    description="Lorem ipsum",
    start_date=datetime(2024, 4, 18),
    # schedule_interval = '*/5 * * * *', # schedule_interval supports CRON expressions
    # schedule=timedelta(minutes=5)
) as dag:
    # in order to connect, we need to create an "Amazon Web Service" connection in Airflow panel!!!
    # check if the object exists in S3/MinIO storage
    sensor_task = S3KeySensor(
        task_id="file_sensor",
        bucket_name="airflow-bucket",
        bucket_key="data.csv",
        aws_conn_id="sensor_minio_s3"
    ) 

    ner_task = PythonOperator(
        task_id="ner_task",
        python_callable=recognize_entities
    )

sensor_task >> ner_task