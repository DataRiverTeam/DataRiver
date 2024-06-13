from airflow.models.baseoperator import BaseOperator
import ast
import json


class NerStatisticsOperator(BaseOperator):
    template_fields = ("json_data")

    def __init__(self, *, json_data, **kwargs):
        super().__init__(**kwargs)
        self.json_data = json_data

    def execute(self, context):
        label_counter = dict()
        entity_counter = dict()

        for data in self.json_data:
            detected = ast.literal_eval(json.dumps(data))

            for sentence in detected:
                text = sentence["text"]
                for ent in sentence["ents"]:
                    label = ent["label"]
                    if label in label_counter:
                        label_counter[label] = label_counter[label] + 1
                    else:
                        label_counter[label] = 1
                    start = ent["start"]
                    end = ent["end"]
                    entity = text[start:end]
                    if entity in entity_counter:
                        entity_counter[entity] = entity_counter[entity] + 1
                    else:
                        entity_counter[entity] = 1

        returned_tuple = (label_counter, entity_counter)
        context["ti"].xcom_push(key="stats", value=returned_tuple)
