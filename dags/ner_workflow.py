from airflow import DAG
from airflow.operators.python import PythonOperator, PythonVirtualenvOperator

from typing import Dict

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
}


# example_text = "Nie ma tak, że dobrze czy nie dobrze.   "
# TODO: move download_dir to Airflow variable or DAG parameter
download_dir = "data/"


# This task's purpose is to download all the needed files.
# It passes list of files to next tasks in two ways: Xcoms and TaskAPI because I'm still not sure which one should we use 
def prepare_files(ti):
    files = ["example_file.txt"]
    ti.xcom_push(key="files", value=files)

    return files

# Task expects list of strings containing file names.
# It opens every file from the list, performs language detection and groups the files based on detected language
# def detect_language(files: list[str]):
def detect_language(ti):
    import langdetect

    files = ti.xcom_pull(key="files", task_ids="prepare_files")
    langs = {}

    print(files)
    for file_name in files:
        file_path = download_dir + file_name
        try:
            with open(file_path, "r") as f:
                text = f.read()

                lang = langdetect.detect(text) 
                
                if lang not in langs:
                    langs[lang] = []
                langs[lang].append(file_name)
            
        except IOError:
            print("There was an error when processing file: " + file_path)
            # handle error
            pass

    
    ti.xcom_push(key="langs", value=langs)

    return langs


# Task translates text files, based on received dict from "detect_languages".
def translate(ti):
    from translate import Translator
    langs: Dict[str, list[str]] = ti.xcom_pull(key="langs", task_ids="detect_language")
    download_dir = "data/"              # temporary fix for PythonVenvOperator, don't remove, unless you passed this value as param/variable!
                                        # ("no variables outside of the scope may be referenced.")
    for lang in langs:
        if lang == "en":
            continue

        translator= Translator(from_lang=lang, to_lang="en")
        print("Translating language: " , lang)
        for file_name in langs[lang]:
            try:
                with open(download_dir + file_name, "r+") as f:
                    text = f.read()
                    translation = translator.translate(text)
                    f.write(translation)        # perhaps we need to make sure that we use proper char encoding when writing
            except IOError:
                # handle error
                pass


def detect_entities(ti):
    # from io import BytesIO
    from minio import Minio
    import spacy

    files = ti.xcom_pull(key="files", task_ids="prepare_files")
    
    # in case we want to download data from cloud storage
    # client = Minio(
    #     minio_url,
    #     access_key=minio_access_key,
    #     secret_key=minio_secret_key,
    #     secure=False
    # )


    for file in files:
        # in case we download file for Airflow cluster node from MinIO
        # response = client.fget_object("airflow-bucket", download_dir + file, download_path)

        nlp = spacy.load("en_core_web_md")
        try:
            with open(download_dir + file, "r") as f: 
                doc = nlp(f.read())


                # ent - named entity detected by nlp
                # ent.label_ - label assigned to text fragment (e.g. Google -> Company, 30 -> Cardinal)
                # ent.sent - sentence including given entity
                for ent in doc.ents:
                    print(ent.text + " | " + str(ent.label_) + " | " + str(ent.sent))


                # TODO:
                # pass data from this task further, so we can store it in database

                # suggestion:
                # if we are not going to pass data to cloud storage, 
                # we can create Python dict using structure like this:
                # {
                #   "filename1": {
                #       "sentence1": [
                #           {text: "...", "label": "..."},
                #           {text: "...", "label": "..."},
                #            ...
                #       ],
                #       "sentence2": [
                #           {text: "...", "label": "..."},
                #            ...
                #       ]
                #   },
                #   "filename2": {
                #       ...
                #   }
                # }
                #
                # Alternatively we can refrain from including file names as keys, depending on what we are going to store in database later


        except IOError:
            raise Exception("Given file doesn't exist!")
    


with DAG('text_workflow', default_args=default_args, schedule_interval=None) as dag:
    file_preparation_task = PythonOperator(
        task_id="prepare_files",
        python_callable=prepare_files,
    )
    
    detect_language_task = PythonOperator(
        task_id='detect_language',
        python_callable=detect_language,
        # op_kwargs={"text": example_text}
        # op_kwargs={"files": []}
    )

    translate_task = PythonOperator(
        task_id='translate',
        python_callable=translate,
    )


    # We can't use PythonVirtualenvOperator, because it's not possible to pass Task instance data to isolated environment.
    # Because of this, for now, we are forced to install requiremed modules globally,
    # OR
    # Launch DAG for each file separately, and perhaps store file name retrieved from some FileSensor


    # translate_task = PythonVirtualenvOperator(
    #     task_id='translate',
    #     python_callable=translate,
    #     requirements=["translate==3.6.1"],
    #     system_site_packages=False,
    # )

    entity_detection_task = PythonOperator(
        task_id="detect_entities",
        python_callable=detect_entities,
    )


file_preparation_task >> detect_language_task >> translate_task >> entity_detection_task