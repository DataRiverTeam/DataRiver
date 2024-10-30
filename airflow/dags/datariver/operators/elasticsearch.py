from airflow.models.baseoperator import BaseOperator
from datariver.operators.json_tools import JsonArgs
from datariver.operators.exceptionmanaging import ErrorHandler


class ElasticPushOperator(BaseOperator):
    template_fields = ("index", "document")

    def __init__(self, *, index, document, es_conn_args={}, **kwargs):
        super().__init__(**kwargs)

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

        es = Elasticsearch(
            **self.es_conn_args
        )
        result = es.search(
            index=self.index,
            query=self.query
        )

        return result.body


class ElasticJsonPushOperator(BaseOperator):
    template_fields = ("fs_conn_id", "json_files_paths", "input_keys", "keys_to_skip", "encoding", "error_key")

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
        error_key,
        **kwargs
    ):
        super().__init__(**kwargs)

        self.fs_conn_id = fs_conn_id
        self.index = index
        self.es_conn_args = es_conn_args
        self.json_files_paths = json_files_paths
        self.input_keys = input_keys             #keys to push to es if present
        self.encoding = encoding
        self.refresh = refresh
        self.keys_to_skip = keys_to_skip         #if input_keys are empty, full document is pushed with exception of keys_to_skip
                                                 #when both are empty, all keys are pushed
        self.error_key = error_key
        # pre_execute = lambda self: setattr(self["task"],"document",{"document": list(self["task_instance"].xcom_pull("detect_entities"))}),

    def execute(self, context):
        from elasticsearch import Elasticsearch, helpers
        es = Elasticsearch(
            **self.es_conn_args
        )
        document_list = []
        for file_path in self.json_files_paths:
            json_args = JsonArgs(
                self.fs_conn_id,
                file_path,
                self.encoding
            )
            error_handler = ErrorHandler(
                file_path,
                self.fs_conn_id,
                self.error_key,
                self.encoding
            )
            document = {}
            if error_handler.is_file_error_free():
                if self.input_keys:
                    document = json_args.get_values(self.input_keys)
                else:
                    present_keys = json_args.get_keys()
                    keys = list(set(present_keys) - set(self.keys_to_skip))
                    document = json_args.get_values(keys)
                document_list.append(document)
            else:
                self.log.info("Found error from previous task for file %s", file_path)

        results = []
        for ok, response in helpers.streaming_bulk(es, document_list, index=self.index):
            results.append(response['index'])
        if self.refresh:
            es.indices.refresh(index=self.index)
        return results
