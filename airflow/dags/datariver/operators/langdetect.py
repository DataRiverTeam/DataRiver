from airflow.models.baseoperator import BaseOperator
from datariver.operators.json_tools import JsonArgs


class JsonLangdetectOperator(BaseOperator):
    template_fields = ("json_files_paths", "fs_conn_id", "input_key", "output_key", "encoding")

    def __init__(self, *, json_files_paths, fs_conn_id="fs_data", input_key, output_key, encoding="utf-8", **kwargs):
        super().__init__(**kwargs)
        self.json_files_paths = json_files_paths
        self.fs_conn_id = fs_conn_id
        self.input_key = input_key
        self.output_key = output_key
        self.encoding = encoding

    def execute(self, context):
        import langdetect
        for file_path in self.json_files_paths:
            json_args = JsonArgs(self.fs_conn_id, file_path, self.encoding)
            text = json_args.get_value(self.input_key)
            lang = langdetect.detect(text)
            json_args.add_value(self.output_key, lang)