from airflow.models.baseoperator import BaseOperator

from datariver.operators.json_tools import JsonArgs

class ElasticPushOperator(BaseOperator):
    template_fields = ("document", "fs_conn_id")

    def __init__(self, *, index, document, fs_conn_id="fs_data", es_conn_args={}, **kwargs):
        super().__init__(**kwargs)

        # note: fs_conn_id is probably useless in the elasticsearch operators
        self.fs_conn_id = fs_conn_id
        self.index = index
        self.document = document
        self.es_conn_args = es_conn_args

    def execute(self, context):
        from elasticsearch import Elasticsearch

        es = Elasticsearch(
            **self.es_conn_args
        )
        es.index(
            index=self.index,
            document=self.document
        )
        es.indices.refresh(index=self.index)


class ElasticSearchOperator(BaseOperator):

    def __init__(
        self,
        *,
        index,
        query={"match_all": {}},
        fs_conn_id="fs_data",
        es_conn_args={},
        **kwargs
    ):
        super().__init__(**kwargs)
        self.fs_conn_id = fs_conn_id
        self.index = index
        self.query = query
        self.es_conn_args = es_conn_args

    def execute(self, context):
        from elasticsearch import Elasticsearch

        es = Elasticsearch(
            **self.es_conn_args
        )
        result = es.search(
            index=self.index,
            query=self.query
        )

        return result.body

class ElasticJsonPushOperator(BaseOperator):
    template_fields = ("fs_conn_id", "json_file_path", "input_key", "encoding")

    def __init__(self, *, index, fs_conn_id="fs_data", es_conn_args={}, json_file_path, input_key, encoding="utf-8", **kwargs):
        super().__init__(**kwargs)

        # note: fs_conn_id is probably useless in the elasticsearch operators
        self.fs_conn_id = fs_conn_id
        self.index = index
        self.es_conn_args = es_conn_args
        self.json_file_path = json_file_path
        self.input_key = input_key
        self.encoding = encoding

#pre_execute = lambda self: setattr(self["task"],"document",{"document": list(self["task_instance"].xcom_pull("detect_entities"))}),

    def execute(self, context):
        from elasticsearch import Elasticsearch
        json_args = JsonArgs(self.fs_conn_id, self.json_file_path, self.encoding)
        document = {}
        document["document"] = list(json_args.get_value(self.input_key))

        es = Elasticsearch(
            **self.es_conn_args
        )
        es.index(
            index=self.index,
            document=document
        )
        es.indices.refresh(index=self.index)