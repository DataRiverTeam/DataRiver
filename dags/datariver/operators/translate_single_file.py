from airflow.models.baseoperator import BaseOperator
from deep_translator import GoogleTranslator
from airflow.hooks.filesystem import FSHook
from airflow.utils.log.logging_mixin import LoggingMixin
import os
import shutil

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


class SingleFileTranslatorOperator(BaseOperator, LoggingMixin):
    template_fields = ("file", "output_language", "fs_conn_id", "translated_file_path")

    def __init__(self, *, file, output_language, translated_file_path, fs_conn_id="fs_default", **kwargs):
        super().__init__(**kwargs)
        self.file = file
        self.output_language = output_language
        self.fs_conn_id = fs_conn_id
        self.translated_file_path = translated_file_path

    def execute(self, context):
        import nltk
        import langdetect

        hook = FSHook(self.fs_conn_id)
        basepath = hook.get_path()

        nltk.download("punkt")

        translators = {}

        lang_count = {}
        successfully_translated = 0
        not_translated = 0 # files where the detected language is the same as the target language

        file_path = self.file
        full_path = os.path.join(basepath, file_path)
        # create not existing directories or open will throw an error
        new_path = os.path.join(basepath, self.translated_file_path)
        os.makedirs(os.path.dirname(new_path), exist_ok=True)
        try:
            text = ""
            with open(full_path, "r") as f:
                # TODO:
                # We probably shouldn't read the whole text file at once - what if the file is REALLY big?
                text = f.read()

                lang = langdetect.detect(text)
                print(lang)

                if lang in lang_count:
                    lang_count[lang] = lang_count[lang] + 1
                else:
                    lang_count[lang] = 1

                if lang not in translators:
                    translators[lang] = GoogleTranslator(source=lang, target="en")

                if lang == self.output_language:
                    shutil.copyfile(full_path, new_path)
                    not_translated += 1

            # Rename source text file - we mark it as being in use,
            # so we can simultaneously read from it and put translated text to a new file.
            # It allows reusage of the old Xcom list from "fetch_data" task.
            # TODO: think of a better way to preserve old files
            # (maybe create a new folder and move new copies there?)
            print(f"Translating {full_path} from {lang} to {self.output_language}")

            with open(new_path, "w") as new_f:
                translator = translators[lang]
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
                        new_f.write(
                            translation)  # perhaps we should make sure that we use proper char encoding when writing to file?
                        l = r + 1
                        total_length = 0
                    r += 1
                else:
                    to_translate = " ".join(sentences[l: r + 1])
                    translation = translator.translate(to_translate)
                    new_f.write(translation)

                successfully_translated += 1

        except IOError as e:
            self.log.error(f"Couldn't open {file_path} ({str(e)})!")


        stats = {}
        stats["title"] = "Translation"
        stats["stats"] = {
            "Unique languages detected": lang_count,
            "Successfully translated": successfully_translated,
            "Translation unrequired": not_translated,
            "Errors": 1 - successfully_translated - not_translated
        }

        context["ti"].xcom_push(key="stats", value=stats)