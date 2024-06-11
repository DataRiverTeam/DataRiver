from airflow.models.baseoperator import BaseOperator

import os

class ElasticPushOperator(BaseOperator):

    def __init__(self, *, index, document, fs_conn_id="fs_default", **kwargs):
        super().__init__(**kwargs)
        self.fs_conn_id = fs_conn_id
        self.index = index
        self.document = document

    def execute(self, context):
        from elasticsearch import Elasticsearch

        es = Elasticsearch(
            os.environ["ELASTIC_HOST"],
            ca_certs="/usr/share/elasticsearch/config/certs/ca/ca.crt",
            basic_auth=("elastic", os.environ["ELASTIC_PASSWORD"]),
            verify_certs=True,
        )
        es.index(
            index=self.index,
            document=self.document
        )
        es.indices.refresh(index=self.index)
