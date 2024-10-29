from calendar import error

from airflow.models.baseoperator import BaseOperator
from airflow.utils.log.logging_mixin import LoggingMixin
from datariver.operators.json_tools import JsonArgs
from datariver.operators.exceptionmanaging import ErrorHandler

# TODO:
# Perhaps we should make the operator more universal?
MAX_FRAGMENT_LENGTH = 4000
language_names = {
    'cs': 'czech',
    'da': 'danish',
    'nl': 'dutch',
    'en': 'english',
    'et': 'estonian',
    'fi': 'finnish',
    'fr': 'french',
    'de': 'german',
    'el': 'greek',
    'it': 'italian',
    'no': 'norwegian',
    'pl': 'polish',
    'pt': 'portuguese',
    'ru': 'russian',
    'sl': 'slovene',
    'es': 'spanish',
    'sv': 'swedish',
    'tr': 'turkish'
}


class JsonTranslateOperator(BaseOperator, LoggingMixin):
    template_fields = ("json_files_paths", "output_language", "fs_conn_id", "input_key", "output_key", "encoding", "error_key")

    def __init__(self, *, json_files_paths, output_language, fs_conn_id="fs_data", input_key,  output_key, encoding="utf-8", error_key, **kwargs):
        super().__init__(**kwargs)
        self.json_files_paths = json_files_paths
        self.output_language = output_language
        self.fs_conn_id = fs_conn_id
        self.input_key = input_key
        self.output_key = output_key
        self.encoding = encoding
        self.error_key = error_key

    def execute(self, context):
        import nltk
        from deep_translator import GoogleTranslator
        translators = {}
        for file_path in self.json_files_paths:
            json_args = JsonArgs(self.fs_conn_id, file_path, self.encoding)
            error_handler = ErrorHandler(
                file_path,
                self.fs_conn_id,
                self.error_key,
                self.encoding
            )

            if error_handler.is_file_error_free():
                #it would be helpful to somehow get info from json_args if there was error when opening file
                text = json_args.get_value(self.input_key)
                lang = json_args.get_value("language")
                if text is None:
                    error_handler.save_error_to_file(f"Value stored under key {self.input_key} could not be read",
                                                     self.task_id)
                    continue
                if lang == self.output_language:
                    translated_text = text
                else:
                    if lang not in translators:
                        translators[lang] = GoogleTranslator(source=lang, target="en")
                    translator = translators[lang]
                    print(f"Translating {json_args.get_full_path()} from {lang} to {self.output_language}")

                    translated_text = ""
                    # split text to sentences, so we can translate only a fragment instead of the whole file
                    sentences = nltk.tokenize.sent_tokenize(text, language=language_names[lang])

                    l = 0
                    r = 0
                    total_length = 0
                    while r < len(sentences):
                        if total_length + len(sentences[r]) < MAX_FRAGMENT_LENGTH:
                            total_length += len(sentences[r])
                        else:
                            to_translate = " ".join(sentences[l: r + 1])
                            translation = translator.translate(to_translate)
                            translated_text += translation  # perhaps we should make sure that we use proper char encoding when writing to file?
                            l = r + 1
                            total_length = 0
                        r += 1
                    else:
                        to_translate = " ".join(sentences[l: r + 1])
                        translation = translator.translate(to_translate)
                        translated_text += translation

                json_args.add_value(self.output_key, translated_text)
            else:
                self.log.info("Found error from previous task for file %s", file_path)
