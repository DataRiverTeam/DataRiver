from calendar import error

from airflow.models.baseoperator import BaseOperator

from datariver.operators.json_tools import JsonArgs

class ErrorHandler:

    def __init__(self, json_file_path, fs_conn_id, error_key, encoding="utf-8", **kwargs):
        super().__init__(**kwargs)
        self.json_files_path = json_file_path
        self.fs_conn_id = fs_conn_id
        self.error_key = error_key
        self.encoding = encoding
        self.json_args = JsonArgs(
            self.fs_conn_id,
            json_file_path,
            self.encoding
        )

#this approach to error handling may be not fully effective due to relying on files, but it supports batching
    def is_file_error_free(self):
        if self.error_key in self.json_args.get_keys():
            return False
        else:
            return True

    def save_error_to_file(self, message, task_id):
        error_data = [task_id, message]
        self.json_args.add_value(self.error_key, error_data)