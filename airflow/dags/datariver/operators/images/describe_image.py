from airflow.models.baseoperator import BaseOperator
from datariver.operators.common.json_tools import JsonArgs


class JsonDescribeImage(BaseOperator):
    template_fields = (
        "json_files_paths",
        "fs_conn_id",
        "input_key",
        "output_key",
        "encoding",
        "local_model_path",
    )

    def __init__(
        self,
        *,
        json_files_paths,
        fs_conn_id="fs_data",
        input_key,
        output_key,
        encoding="utf-8",
        local_model_path=None,
        **kwargs
    ):
        super().__init__(**kwargs)
        self.json_files_paths = json_files_paths
        self.fs_conn_id = fs_conn_id
        self.input_key = input_key
        self.output_key = output_key
        self.encoding = encoding
        self.local_model_path = local_model_path

    def execute(self, context):
        from transformers import BlipProcessor, BlipForConditionalGeneration
        from PIL import Image

        # Load the pre-trained BLIP model and processor
        if self.local_model_path is None:
            model_source = "Salesforce/blip-image-captioning-base"
        else:
            model_source = self.local_model_path
        model = BlipForConditionalGeneration.from_pretrained(model_source)
        processor = BlipProcessor.from_pretrained(model_source)
        for file_path in self.json_files_paths:
            json_args = JsonArgs(self.fs_conn_id, file_path, self.encoding)
            image = json_args.get_image(self.input_key)
            if image == None:
                # todo write error
                continue

            # Preprocess the image and prepare inputs for the model
            inputs = processor(images=image, return_tensors="pt")
            # Generate caption
            caption = model.generate(**inputs, max_new_tokens=100)
            # Decode the generated caption
            caption_text = processor.decode(caption[0], skip_special_tokens=True)

            json_args.add_value(self.output_key, caption_text)
