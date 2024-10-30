from airflow.models.baseoperator import BaseOperator
from airflow.hooks.filesystem import FSHook
from datariver.operators.json_tools import JsonArgs
import os
from datariver.operators.exceptionmanaging import ErrorHandler


class JsonLangdetectOperator(BaseOperator):
    template_fields = ("json_files_paths", "fs_conn_id", "input_key", "output_key", "encoding", "error_key")

    def __init__(self, *, json_files_paths, fs_conn_id="fs_data", input_key, output_key, encoding="utf-8", error_key, **kwargs):
        super().__init__(**kwargs)
        self.json_files_paths = json_files_paths
        self.fs_conn_id = fs_conn_id
        self.input_key = input_key
        self.output_key = output_key
        self.encoding = encoding
        self.error_key = error_key

    def execute(self, context):
        import langdetect
        for file_path in self.json_files_paths:
            error_handler = ErrorHandler(
                file_path,
                self.fs_conn_id,
                self.error_key,
                self.encoding
            )
            json_args = JsonArgs(self.fs_conn_id, file_path, self.encoding)
            text = json_args.get_value(self.input_key)
            # if text does not contain key, language cannot be detected
            if text is None:
                error_handler.save_error_to_file(f"Value stored under key {self.input_key} could not be read", self.task_id)
                #now it's time to look for that error in another tasks and do nothing for that specified file if found
            else:
                lang = langdetect.detect(text)
                json_args.add_value(self.output_key, lang)