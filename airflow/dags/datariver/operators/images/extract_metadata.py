from airflow.models.baseoperator import BaseOperator
from datariver.operators.common.json_tools import JsonArgs
from enum import StrEnum

# This operator doesn't work
class ExifType(StrEnum):
    exif = 'exif'
    pillow = 'pillow'
    def __contains__(self, item):
        if isinstance(item, self):
            return True
        return any(item == member.value for member in self.__members__.values())

class JsonExtractMetadata(BaseOperator):
    template_fields = ("json_files_paths", "fs_conn_id", "input_key", "output_key", "encoding")

    def __init__(self, *, json_files_paths, fs_conn_id="fs_data", input_key, output_key, exif_type:str="exif", exif_tags=None, encoding="utf-8", **kwargs):
        super().__init__(**kwargs)
        self.json_files_paths = json_files_paths
        self.fs_conn_id = fs_conn_id
        self.input_key = input_key
        self.output_key = output_key
        self.encoding = encoding
        if exif_tags is None:
            self.exif_tags = [
                271,    # Camera Make
                272,    # Camera Model
                36867,  # Date/Time Photo Taken
                34853,  # GPS Info
            ]
        else:
            self.exif_tags = exif_tags
        if exif_type not in ExifType:
            raise AttributeError(f"unsupported ExifType {exif_type}")
        self.exif_type: ExifType = ExifType(exif_type)

    def execute(self, context):
        from PIL import Image as PillowImage
        from PIL import ExifTags

        for file_path in self.json_files_paths:
            json_args = JsonArgs(self.fs_conn_id, file_path, self.encoding)
            image_path = json_args.get_value(self.input_key)
            image_full_path = JsonArgs.generate_full_path(image_path, self.fs_conn_id)
            match self.exif_type:
                case ExifType.exif:
                    metadata = self.exif_library(image_full_path)
                case ExifType.pillow:
                    metadata = self.pillow_library(image_full_path)
                case _:
                    raise AttributeError()

            json_args.add_value(self.output_key, metadata)

    def exif_library(self,  image_path: str):
        from exif import Image as ExifImage
        with open(image_path, 'rb') as input_file:
            img = ExifImage(input_file)

        img.list_all()
        print(img.list_all())
        return img.list_all()

    def pillow_library(self, image_path: str):
        from PIL import Image as PillowImage
        from PIL import ExifTags
        pillow_img = PillowImage.open(image_path)
        img_exif = pillow_img.getexif()
        print(img_exif)
        metadata = []
        print(f"exif tags: {self.exif_tags}")
        print(f"iamge path: {image_path}")
        for tag in self.exif_tags:
            try:
                print()
                english_tag = ExifTags.TAGS[tag]
                value = img_exif[tag]
            except Exception as e:
                print(f"Todo: add error handling: {e}")
                continue
            metadata.append({english_tag: value})
            print(f"{english_tag}: {value}")
        return metadata