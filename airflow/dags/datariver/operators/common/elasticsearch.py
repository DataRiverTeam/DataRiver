from airflow.models.baseoperator import BaseOperator
from datariver.operators.common.json_tools import JsonArgs
from datariver.operators.common.exception_managing import ErrorHandler


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
        document_list = []
        file_paths_list = []
        for file_path in self.json_files_paths:
            json_args = JsonArgs(self.fs_conn_id, file_path, self.encoding)
            document = {}

            if self.input_keys:
                document = json_args.get_values(self.input_keys)
            else:
                present_keys = json_args.get_keys()
                keys = list(set(present_keys) - set(self.keys_to_skip))
                document = json_args.get_values(keys)
            document_list.append(document)
            file_paths_list.append(file_path)

        results = []
        for ok, response in helpers.streaming_bulk(es, document_list, index=self.index):
            results.append(response["index"])
        if self.refresh:
            es.indices.refresh(index=self.index)

        i = 0
        for result in results:
            if "_id" in result:
                json_args = JsonArgs(self.fs_conn_id, file_paths_list[i], self.encoding)
                json_args.add_value("es_document_id", result["_id"])
            i+=1

        return results

class ElasticJsonUpdateOperator(BaseOperator):
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
            error_key="error",
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
        self.error_key = error_key
        self.keys_to_skip = keys_to_skip  # if input_keys are empty, full document is pushed with exception of keys_to_skip
        # when both are empty, all keys are pushed

    def execute(self, context):
        from elasticsearch import Elasticsearch, helpers

        es = Elasticsearch(**self.es_conn_args)
        operations = []
        for file_path in self.json_files_paths:
            json_args = JsonArgs(self.fs_conn_id, file_path, self.encoding)
            document = {}

            if "es_document_id" in document:
                if self.input_keys:
                    document = json_args.get_values(self.input_keys)
                else:
                    present_keys = json_args.get_keys()
                    keys = list(set(present_keys) - set(self.keys_to_skip))
                    document = json_args.get_values(keys)

                operation = {
                    "_op_type": "update",
                    "_index": self.index,
                    "_id": document["es_document_id"],
                    "doc": {key: value for key, value in document.items() if key != "es_document_id"}
                }
                operations.append(operation)

            else:
                error_handler = ErrorHandler(
                    file_path, self.fs_conn_id, self.error_key, self.task_id, self.encoding
                )
                error_handler.save_error_to_file(
                    f"Document which does not have es_document_id can not be updated"
                )

        results = []
        for ok, response in helpers.streaming_bulk(es, operations):
            results.append(response["index"])
        if self.refresh:
            es.indices.refresh(index=self.index)

        return results