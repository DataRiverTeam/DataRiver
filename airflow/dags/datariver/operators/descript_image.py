from airflow.models.baseoperator import BaseOperator
from datariver.operators.json_tools import JsonArgs


class JsonDescriptImage(BaseOperator):
    template_fields = ("json_files_paths", "fs_conn_id", "input_key", "output_key", "encoding")

    def __init__(self, *, json_files_paths, fs_conn_id="fs_data", input_key, output_key, encoding="utf-8", **kwargs):
        super().__init__(**kwargs)
        self.json_files_paths = json_files_paths
        self.fs_conn_id = fs_conn_id
        self.input_key = input_key
        self.output_key = output_key
        self.encoding = encoding


    def execute(self, context):
        from transformers import BlipProcessor, BlipForConditionalGeneration
        from PIL import Image
        # Load the pre-trained BLIP model and processor
        model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
        processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        for file_path in self.json_files_paths:
            json_args = JsonArgs(self.fs_conn_id, file_path, self.encoding)
            image_path = json_args.get_value(self.input_key)
            image_full_path = JsonArgs.generate_full_path(image_path, self.fs_conn_id)
            image = Image.open(image_full_path)

            # Preprocess the image and prepare inputs for the model
            inputs = processor(images=image, return_tensors="pt")
            # Generate caption
            caption = model.generate(**inputs, max_new_tokens=100)
            # Decode the generated caption
            caption_text = processor.decode(caption[0], skip_special_tokens=True)

            json_args.add_value(self.output_key, caption_text)