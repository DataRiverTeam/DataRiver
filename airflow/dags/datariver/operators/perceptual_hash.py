from airflow.models.baseoperator import BaseOperator
from datariver.operators.json_tools import JsonArgs
from enum import StrEnum


class HashType(StrEnum):
    p_hash = 'p_hash'
    block_mean_hash = 'block_mean_hash'
    def __contains__(self, item):
        if isinstance(item, self):
            return True
        return any(item == member.value for member in self.__members__.values())

class JsonPerceptualHash(BaseOperator):
    template_fields = ("json_files_paths", "fs_conn_id", "input_key", "output_key", "encoding")

    def __init__(self, *, json_files_paths, fs_conn_id="fs_data", input_key, output_key, hash_type:str="block_mean_hash", encoding="utf-8", **kwargs):
        super().__init__(**kwargs)
        self.json_files_paths = json_files_paths
        self.fs_conn_id = fs_conn_id
        self.input_key = input_key
        self.output_key = output_key
        self.encoding = encoding
        if hash_type not in HashType:
            # todo add error handling here someheow
            raise AttributeError(f"unsupported HashType {hash_type}")
        self.hash_type: HashType = HashType(hash_type)

    def execute(self, context):
        import cv2

        for file_path in self.json_files_paths:
            json_args = JsonArgs(self.fs_conn_id, file_path, self.encoding)
            image_path = json_args.get_value(self.input_key)
            image_full_path = JsonArgs.generate_full_path(image_path, self.fs_conn_id)
            match self.hash_type:
                case HashType.p_hash:
                    hash_value = self.p_hash(image_full_path)
                case HashType.block_mean_hash:
                    hash_value = self.block_mean_hash(image_full_path)
                case _:
                    raise AttributeError()
            json_args.add_value(self.output_key, hash_value)

    def p_hash(self, image_path: str):
        import cv2
        img = cv2.imread(image_path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) # should it be converted to Gray?
        hash_value = cv2.img_hash.pHash(img)  # 8-byte hash
        hash_int = int.from_bytes(hash_value.tobytes(), byteorder='big', signed=False)
        return hash_int

    def block_mean_hash(self, image_path):
        import cv2
        img = cv2.imread(image_path)
        block_mean_hash = cv2.img_hash.BlockMeanHash_create()
        hash_value = block_mean_hash.compute(img)
        hash_int = int.from_bytes(hash_value.tobytes(), byteorder='big', signed=False)
        return hash_int