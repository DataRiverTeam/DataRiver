from airflow.models.baseoperator import BaseOperator

class LangdetectOperator(BaseOperator):
    template_fields = ("files")     # needed to be able to use Jinja templating for 'files' variable
    
    def __init__(self, *, files, **kwargs):
        super().__init__(**kwargs)
        self.files = files
        

    def execute(self, context):
        import langdetect

        langs = {}
        for file_path in self.files:
            print("Opening file:", file_path)
            try:
                with open(file_path, "r") as f:
                    text = f.read()
                    lang = langdetect.detect(text) 
                    if lang not in langs:
                        langs[lang] = []
                    langs[lang].append(file_path)
            except IOError:
                print("There was an error when processing file: " + file_path)
        return langs        # returning value from execute() is equivalent to 
                            # context["ti"].xcom_push(key="return_value", value=langs)