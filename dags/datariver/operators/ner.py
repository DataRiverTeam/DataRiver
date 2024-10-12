from airflow.models.baseoperator import BaseOperator
from airflow.hooks.filesystem import FSHook
import os

from datariver.operators.json_tools import JsonArgsBaseOperator

class NerOperator(BaseOperator):    
    template_fields = ("path", "fs_conn_id")

    def __init__(self, *, path, fs_conn_id="fs_default", model="en_core_web_sm", language="english", **kwargs):
        super().__init__(**kwargs)
        self.path = path
        self.fs_conn_id = fs_conn_id
        self.model = model
        self.language = language

    def execute(self, context):
        import spacy    
        import nltk
        nltk.download("punkt")  # download sentence tokenizer used for splitting text to sentences
        
        hook = FSHook(self.fs_conn_id)

        file_path = os.path.join(hook.get_path(), self.path)
        nlp = spacy.load(self.model)
        
        detected = []
        
        try:
            with open(file_path, "r") as f:
                print(f"Reading file {file_path}") 
                text = f.read()
                sentences = nltk.tokenize.sent_tokenize(text, self.language)
                for s in sentences:
                    doc = nlp(s)

                    
                    detected.append(doc.to_json()) # I'm not convinced if we should return all the data in JSON format specifically

                    # .ent - named entity detected by nlp
                    # .ent.label_ - label assigned to text fragment (e.g. Google -> Company, 30 -> Cardinal)
                    # .sent - sentence including given entity 
        except IOError:
            print("There was an error when processing file: " + file_path)

        return detected


class NerJsonOperator(JsonArgsBaseOperator):
    template_fields = ("json_file_path", "fs_conn_id", "input_key", "output_key", "encoding")

    def __init__(self, *, json_file_path, fs_conn_id="fs_default", model="en_core_web_sm", language="english",
                 input_key="translated", output_key="ner", encoding="utf-8", **kwargs):
        super().__init__(**kwargs)
        self.json_file_path = json_file_path
        self.fs_conn_id = fs_conn_id
        self.model = model
        self.language = language
        self.input_key = input_key
        self.output_key = output_key
        self.encoding = encoding

    def execute(self, context):
        import spacy
        import nltk
        nltk.download("punkt")  # download sentence tokenizer used for splitting text to sentences

        hook = FSHook(self.fs_conn_id)

        file_path = os.path.join(hook.get_path(), self.json_file_path)
        nlp = spacy.load(self.model)

        detected = []

        text = self.get_value(file_path, self.encoding, self.input_key)

        sentences = nltk.tokenize.sent_tokenize(text, self.language)
        for s in sentences:
            doc = nlp(s)

            detected.append(
                doc.to_json())  # I'm not convinced if we should return all the data in JSON format specifically

            # .ent - named entity detected by nlp
            # .ent.label_ - label assigned to text fragment (e.g. Google -> Company, 30 -> Cardinal)
            # .sent - sentence including given entity

        self.add_value(file_path, self.encoding, self.output_key, detected)