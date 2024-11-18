from airflow.models.baseoperator import BaseOperator
from datariver.operators.common.json_tools import JsonArgs


class ElasticPushOperator(BaseOperator):
    template_fields = ("index", "document")

    def __init__(self, *, index, document, es_conn_args={}, **kwargs):
        super().__init__(**kwargs)

        self.index = index
        self.document = document
        self.es_conn_args = es_conn_args

    def execute(self, context):
        from elasticsearch import Elasticsearch

        es = Elasticsearch(**self.es_conn_args)
        es.index(index=self.index, document=self.document)
        es.indices.refresh(index=self.index)


class ElasticSearchOperator(BaseOperator):
    template_fields = ("index", "query")

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
        self.index = index
        self.query = query
        self.es_conn_args = es_conn_args

    def execute(self, context):
        from elasticsearch import Elasticsearch

        es = Elasticsearch(**self.es_conn_args)
        result = es.search(index=self.index, query=self.query)

        return result.body


class ElasticJsonPushOperator(BaseOperator):
    template_fields = (
        "fs_conn_id",
        "json_files_paths",
        "input_keys",
        "keys_to_skip",
        "encoding",
    )

    def __init__(
        self,
        *,
        index,
        fs_conn_id="fs_data",
        es_conn_args={},
        json_files_paths,
        input_keys=[],
        encoding="utf-8",
        refresh=False,
        keys_to_skip=[],
        **kwargs
    ):
        super().__init__(**kwargs)

        self.fs_conn_id = fs_conn_id
        self.index = index
        self.es_conn_args = es_conn_args
        self.json_files_paths = json_files_paths
        self.input_keys = input_keys  # keys to push to es if present
        self.encoding = encoding
        self.refresh = refresh
        self.keys_to_skip = keys_to_skip  # if input_keys are empty, full document is pushed with exception of keys_to_skip
        # when both are empty, all keys are pushed

    def execute(self, context):
        from elasticsearch import Elasticsearch, helpers

        es = Elasticsearch(**self.es_conn_args)
        documents_with_id = []
        documents_without_id = []
        for file_path in self.json_files_paths:
            json_args = JsonArgs(self.fs_conn_id, file_path, self.encoding)
            document = {}
            present_keys = json_args.get_keys()

            if self.input_keys:
                document = json_args.get_values(self.input_keys)
            else:
                keys = list(set(present_keys) - set(self.keys_to_skip))
                document = json_args.get_values(keys)
            #regardless of keys chosen by user, es_document_id has to be present in a document if it has an id
            if "es_document_id" in present_keys:
                if "es_document_id" not in document:
                    document["es_document_id"] = json_args.get_value("es_document_id")
                documents_with_id.append(document)
            else:
                document_with_path = (document, file_path)
                documents_without_id.append(document_with_path)

        results = []
        for document_with_path in documents_without_id:
            document = document_with_path[0]
            file_path = document_with_path[1]
            response = es.index(index=self.index, document=document)
            document_id = response["_id"]
            results.append(response.body)
            json_args = JsonArgs(self.fs_conn_id, file_path, self.encoding)
            json_args.add_value("es_document_id", document_id)

        for document in documents_with_id:
            document_id = document["es_document_id"]
            response = es.update(index=self.index, id=document_id, body={"doc": document})
            results.append(response.body)

        if self.refresh:
            es.indices.refresh(index=self.index)
        return results
