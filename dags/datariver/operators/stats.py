from airflow.models.baseoperator import BaseOperator
import ast
import json


from datariver.operators.json_tools import JsonArgsBaseOperator

class NerStatisticsOperator(BaseOperator):
    template_fields = ("json_data",)

    def __init__(self, *, json_data, **kwargs):
        super().__init__(**kwargs)
        self.json_data = json_data

    def execute(self, context):
        label_counter = dict()
        entity_counter = dict()

        for data in self.json_data:
            detected = ast.literal_eval(json.dumps(data)) #literal_eval is used here, because data pushed to xcom by NerOperator are not in fully correct json format

            text = detected["text"]
            for ent in detected["ents"]:
                label = ent["label"]
                if label in label_counter:
                    label_counter[label] = label_counter[label] + 1
                else:
                    label_counter[label] = 1
                start = ent["start"]
                end = ent["end"]
                entity = text[start:end].replace('\n', '\\n').replace('\t', '\\t')
                if entity in entity_counter:
                    entity_counter[entity] = entity_counter[entity] + 1
                else:
                    entity_counter[entity] = 1

        stats = {
            "title": "NER statistics",
            "stats": {
                "labels": label_counter,
                "entities": entity_counter
            }
        }

        context["ti"].xcom_push(key="stats", value=stats)


class NerJsonStatisticsOperator(JsonArgsBaseOperator):
    template_fields = ("json_path", "fs_conn_id", "input_key", "output_key", "encoding")

    def __init__(self, *, json_path, fs_conn_id, input_key, output_key, encoding="utf-8", **kwargs):
        super().__init__(**kwargs)
        self.json_path = json_path
        self.fs_conn_id = fs_conn_id
        self.input_key = input_key
        self.output_key = output_key
        self.encoding = encoding

    def execute(self, context):
        label_counter = dict()
        entity_counter = dict()

        full_path = self.generate_full_path(self.json_path, self.fs_conn_id)
        json_data = self.get_value_from_json_file(full_path, self.encoding, self.input_key)

        for data in json_data:
            detected = ast.literal_eval(json.dumps(data)) #literal_eval is used here, because data pushed to xcom by NerOperator are not in fully correct json format

            text = detected["text"]
            for ent in detected["ents"]:
                label = ent["label"]
                if label in label_counter:
                    label_counter[label] = label_counter[label] + 1
                else:
                    label_counter[label] = 1
                start = ent["start"]
                end = ent["end"]
                entity = text[start:end].replace('\n', '\\n').replace('\t', '\\t')
                if entity in entity_counter:
                    entity_counter[entity] = entity_counter[entity] + 1
                else:
                    entity_counter[entity] = 1

        stats = {
            "title": "NER statistics",
            "stats": {
                "labels": label_counter,
                "entities": entity_counter
            }
        }

        self.add_value_to_json_file(full_path, self.encoding, self.output_key, stats)
