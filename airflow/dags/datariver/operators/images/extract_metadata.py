import json
from airflow.models.baseoperator import BaseOperator
from datariver.operators.common.json_tools import JsonArgs


class JsonExtractMetadata(BaseOperator):
    template_fields = (
        "json_files_paths",
        "fs_conn_id",
        "input_key",
        "output_key",
        "encoding",
    )

    def __init__(
        self,
        *,
        json_files_paths,
        fs_conn_id="fs_data",
        input_key,
        output_key,
        encoding="utf-8",
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.json_files_paths = json_files_paths
        self.fs_conn_id = fs_conn_id
        self.input_key = input_key
        self.output_key = output_key
        self.encoding = encoding

    def execute(self, context):
        from PIL import Image, ExifTags

        for file_path in self.json_files_paths:
            json_args = JsonArgs(self.fs_conn_id, file_path, self.encoding)
            image_path = json_args.get_value(self.input_key)
            image_full_path = JsonArgs.generate_absolute_path(
                json_args.get_full_path(), image_path
            )
            image = Image.open(image_full_path)
            exif_info = image._getexif()
            metadata = []
            if exif_info is not None:
                for tag, value in exif_info.items():
                    if isinstance(value, bytes):
                        value = value.decode(encoding=json.detect_encoding(value))
                    else:
                        value = str(value)
                    metadata.append({ExifTags.TAGS.get(tag): value})
            json_args.add_value(self.output_key, metadata)
