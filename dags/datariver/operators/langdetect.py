from airflow.models.baseoperator import BaseOperator
from airflow.hooks.filesystem import FSHook
from datariver.operators.json_tools import JsonArgsBaseOperator
import os

class LangdetectOperator(BaseOperator):
    template_fields = ("files")     # needed to be able to use Jinja templating for 'files' variable
    
    def __init__(self, *, files, fs_conn_id="fs_default", **kwargs):
        super().__init__(**kwargs)
        self.files = files
        self.fs_conn_id = fs_conn_id

    def execute(self, context):
        import langdetect

        hook = FSHook(self.fs_conn_id)
        basepath = hook.get_path()

        langs = {}
        for file_path in self.files:
            full_path = os.path.join(basepath, file_path)
            print("Opening file:", full_path)
            try:
                with open(full_path, "r") as f:
                    text = f.read()
                    lang = langdetect.detect(text) 
                    if lang not in langs:
                        langs[lang] = []
                    langs[lang].append(file_path)
            except IOError:
                print("There was an error when processing file: " + file_path)
        return langs        # returning value from execute() is equivalent to 
                            # context["ti"].xcom_push(key="return_value", value=langs)

class JsonLangdetectOperator(BaseOperator, JsonArgsBaseOperator):
    template_fields = ("json_path", "fs_conn_id", "input_key", "output_key", "encoding")

    def __init__(self, *, json_path, fs_conn_id="fs_default", input_key, output_key, encoding="utf-8", **kwargs):
        super().__init__(**kwargs)
        self.json_path = json_path
        self.fs_conn_id = fs_conn_id
        self.input_key = input_key
        self.output_key = output_key
        self.encoding = encoding

    def execute(self, context):
        import langdetect
        hook = FSHook(self.fs_conn_id)
        basepath = hook.get_path()
        full_path = os.path.join(basepath, self.json_path)
        text = self.get_value(full_path, self.encoding, self.input_key)
        lang = langdetect.detect(text)
        self.add_value(full_path, self.encoding, self.output_key, lang)