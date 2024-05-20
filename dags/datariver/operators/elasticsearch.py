from airflow.models.baseoperator import BaseOperator
from airflow.hooks.filesystem import FSHook
from elasticsearch import Elasticsearch
import os


def __init__(self, *, files, fs_conn_id="fs_default", **kwargs):
    super().__init__(**kwargs)
    self.files = files
    self.fs_conn_id = fs_conn_id

class EntitydetectOperator(BaseOperator):
    template_fields = ("files")

    def execute(self, context):
        import spacy
        import nltk

        nltk.download("punkt")  # download sentence tokenizer used for splitting text to sentences

        hook = FSHook(self.fs_conn_id)
        basepath = hook.get_path()


        es = Elasticsearch(
            os.environ["ELASTIC_HOST"],
            basic_auth=("elastic", os.environ["ELASTIC_PASSWORD"]),
            timeout=60
        )
        es.options(ignore_status=[400, 404]).indices.delete(index='named-entities')
        document = {}
        for file_path in self.files:
            nlp = spacy.load("en_core_web_md")
            full_path = os.path.join(basepath, file_path)
            # get basename and trim extension
            id: str = os.path.splitext(os.path.basename(full_path))[0]
            document[id] = []
            try:
                with open(file_path, "r") as f:
                    text = f.read()
                    sentences = nltk.tokenize.sent_tokenize(text, "english")
                    for s in sentences:
                        doc = nlp(s)
                        document[id].append(doc.to_json())
            except IOError:
                raise Exception("Given file doesn't exist!")

        es.index(
            index="named-entities",
            document=document
        )
