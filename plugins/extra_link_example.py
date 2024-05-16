from airflow.operators.python import PythonOperator
from airflow.models.baseoperatorlink import BaseOperatorLink
from airflow.models.taskinstancekey import TaskInstanceKey
from airflow.plugins_manager import AirflowPlugin


class ExampleLink(BaseOperatorLink):
    name = "Example"

    operators = [PythonOperator]

    def get_link(self, operator: PythonOperator, *, ti_key: TaskInstanceKey):
        return "http://example.com/"


class MyFirstOperator(PythonOperator):
    operator_extra_links = (ExampleLink(),)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def execute(self, context):
        self.log.info("Example extra link plugin loaded")


# Defining the plugin class
class AirflowExtraLinkPlugin(AirflowPlugin):
    name = "extra_link_plugin"
    operator_extra_links = [
        ExampleLink(),
    ]