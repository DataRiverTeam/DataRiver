import json

from airflow.models.baseoperator import BaseOperator
from airflow.hooks.filesystem import FSHook
from airflow.utils.log.logging_mixin import LoggingMixin
import ijson
import os

class MapJsonFile(BaseOperator):

    def __init__(self, *, fs_conn_id="fs_data", path, python_callable, **kwargs):
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
class JsonArgs(LoggingMixin):
    def __init__(self, fs_conn_id, json_file_path, encoding="utf-8", **kwargs):
        super().__init__(**kwargs)
        self.fs_conn_id = fs_conn_id
        self.json_file_path = json_file_path
        self.encoding = encoding

    def hook(self):
        return FSHook(self.fs_conn_id)

    def get_base_path(self):
        return self.hook().get_path()

    def get_full_path(self):
        return os.path.join(self.get_base_path(), self.json_file_path)

    def get_value(self, key):
        value = None
        try:
            with open(self.get_full_path(), "r", encoding=self.encoding) as f:
                data = json.load(f)
                value = data.get(key)
                if value is None:
                    self.log.error(f"{self.get_full_path()} does not contain key {key}!")
        except IOError as e:
            self.log.error(f"Couldn't open {self.get_full_path()} ({str(e)})!")
        return value

    def add_value(self, key, value):
        try:
            with open(self.get_full_path(), "r+", encoding=self.encoding) as f:
                data = json.load(f)
                f.seek(0)
                f.truncate(0)
                data[key] = value
                json.dump(data, f, ensure_ascii=False, indent=2)
        except IOError as e:
            self.log.error(f"Couldn't open {self.get_full_path()} ({str(e)})!")

    def get_values(self, keys):
        value = None
        values = {}
        try:
            with open(self.get_full_path(), "r", encoding=self.encoding) as f:
                data = json.load(f)
                for key in keys:
                    value = data.get(key)
                    if value is None:
                        self.log.error(f"{self.get_full_path()} does not contain key {key}!")
                    else:
                        values[key] = value
        except IOError as e:
            raise RuntimeError(f"Couldn't open {self.get_full_path()} ({str(e)})!")
        return values

    def get_keys(self):
        keys=[]
        try:
            with open(self.get_full_path(), "r", encoding=self.encoding) as f:
                data = json.load(f)
                keys = data.keys()
        except IOError as e:
            self.log.error(f"Couldn't open {self.get_full_path()} ({str(e)})!")
        return keys

    @staticmethod
    def generate_full_path(file_path, fs_conn_id):
        hook = FSHook(fs_conn_id)
        basepath = hook.get_path()
        full_path = os.path.join(basepath, file_path)
        return full_path