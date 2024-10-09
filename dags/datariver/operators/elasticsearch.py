from airflow.models.baseoperator import BaseOperator


class ElasticPushOperator(BaseOperator):
    template_fields = ("document", "fs_conn_id")

    def __init__(self, *, index, document, fs_conn_id="fs_default", es_conn_args={}, **kwargs):
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
        fs_conn_id="fs_default",
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
