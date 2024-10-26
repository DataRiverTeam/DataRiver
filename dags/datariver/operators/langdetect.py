from airflow.models.baseoperator import BaseOperator
from airflow.hooks.filesystem import FSHook
from datariver.operators.json_tools import JsonArgs
import os


class JsonLangdetectOperator(BaseOperator):
    template_fields = ("json_file_path", "fs_conn_id", "input_key", "output_key", "encoding")

    def __init__(self, *, json_file_path, fs_conn_id="fs_data", input_key, output_key, encoding="utf-8", **kwargs):
        super().__init__(**kwargs)
        self.json_file_path = json_file_path
        self.fs_conn_id = fs_conn_id
        self.input_key = input_key
        self.output_key = output_key
        self.encoding = encoding

    def execute(self, context):
        import langdetect
        for file_path in self.json_file_path:
            json_args = JsonArgs(self.fs_conn_id, file_path, self.encoding)
            text = json_args.get_value(self.input_key)
            lang = langdetect.detect(text)
            json_args.add_value(self.output_key, lang)