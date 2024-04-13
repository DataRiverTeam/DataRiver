from datetime import timedelta, datetime
from airflow import DAG
from airflow.operators.python_operator import PythonOperator

# Define your merge function
def merge_files(**kwargs):
    with open(kwargs['file1'], 'r') as file:
        # Read the entire file content
        file1_content = file.read()
    with open(kwargs['file2'], 'r') as file:
        # Read the entire file content
        file2_content = file.read()
    kwargs['ti'].xcom_push(key='data_to_pass', value=file1_content+file2_content)
    

def save_file(**kwargs):
    data_received = kwargs['ti'].xcom_pull(key='data_to_pass', task_ids='merge_files_task')
    with open(kwargs['output_file'], 'w') as file:
        # Read the entire file content
        file.write(data_received)

# Define default arguments for the DAG
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2024, 3, 25),
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

# Define the DAG
dag = DAG(
    'merge_files_dag',
    default_args=default_args,
    description='A DAG to merge two files',
    schedule_interval=None,
)

# Define tasks
merge_files_task = PythonOperator(
    task_id='merge_files_task',
    python_callable=merge_files,
    op_kwargs={
        'file1': '/mnt/c/Users/szymo/Desktop/Studia/AirflowProjects/example/ipsum.txt', 
        'file2': '/mnt/c/Users/szymo/Desktop/Studia/AirflowProjects/example/lorem.txt', 
        },
    dag=dag,
)

# Define tasks
save_task = PythonOperator(
    task_id='save_task',
    python_callable=save_file,
    op_kwargs={
        'output_file': '/mnt/c/Users/szymo/Desktop/Studia/AirflowProjects/example/lorem_ipsum2.txt'
        },
    dag=dag,
)

# Set task dependencies
merge_files_task >> save_task

if __name__ == "__main__":
    dag.cli()