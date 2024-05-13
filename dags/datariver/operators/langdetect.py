from airflow.models.baseoperator import BaseOperator
from airflow.hooks.filesystem import FSHook
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