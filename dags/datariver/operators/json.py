from typing import Callable
from typing import Any

from airflow.models.baseoperator import BaseOperator
from airflow.hooks.filesystem import FSHook
from airflow.utils.context import Context

import ijson
import os


class MapJsonFile(BaseOperator):
    template_fields = ("fs_conn_id", "path")

    def __init__(
        self,
        *,
        fs_conn_id="fs_default",
        path,
        python_callable: Callable[[dict, Context], Any],
        **kwargs
    ):
        super().__init__(**kwargs)
        self.path = path
        self.fs_conn_id = fs_conn_id
        self.python_callable = python_callable

    def execute(self, context):
        hook = FSHook(self.fs_conn_id)
        basepath = hook.get_path()

        full_path = os.path.join(basepath, self.path)

        mapped = []
        with open(full_path, "rb") as f:
            for record in ijson.items(f, "item"):

                mapped.append(self.python_callable(record, context))

        return mapped
