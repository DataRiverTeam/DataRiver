import json
from collections.abc import Callable
from typing import Any

from airflow.models.baseoperator import BaseOperator
from airflow.hooks.filesystem import FSHook
import ijson
import os

class MapJsonFile(BaseOperator):

    def __init__(self, *, fs_conn_id="fs_default", path, python_callable, **kwargs):
        super().__init__(**kwargs)
        self.path=path
        self.fs_conn_id=fs_conn_id
        self.python_callable=python_callable


    def execute(self, context):
        hook = FSHook(self.fs_conn_id)
        basepath = hook.get_path()

        full_path = os.path.join(basepath, self.path)

        mapped = []
        with open(full_path, "rb") as f:
            for record in ijson.items(f, "item"):
                
                mapped.append(self.python_callable(record))

        return mapped

#I see here a huge room for improvement - many fields from operators working with json may have common fields described here?
class JsonArgsBaseOperator(BaseOperator):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def get_value(self, full_path, encoding, key):
        text = None
        try:
            with open(full_path, "r", encoding=encoding) as f:
                data = json.load(f)
                text = data.get(key)
                if text is None:
                    self.log.error(f"{full_path} does not contain key {key}!")
        except IOError as e:
            self.log.error(f"Couldn't open {full_path} ({str(e)})!")
        return text

    def add_value(self, full_path, encoding, key, value):
        try:
            with open(full_path, "r+", encoding=encoding) as f:
                data = json.load(f)
                f.seek(0)
                f.truncate(0)
                data[key] = value
                json.dump(data, f, ensure_ascii=False, indent=2)
        except IOError as e:
            self.log.error(f"Couldn't open {full_path} ({str(e)})!")

    @staticmethod
    def generate_full_path(file_path, fs_conn_id):
        hook = FSHook(fs_conn_id)
        basepath = hook.get_path()
        full_path = os.path.join(basepath, file_path)
        return full_path