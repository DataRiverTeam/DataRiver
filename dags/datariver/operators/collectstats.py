from airflow.models.baseoperator import BaseOperator
from airflow.hooks.filesystem import FSHook
import os


def write_dict_to_file(dictionary, file):
    sorted_dict = dict(sorted(dictionary.items(), key=lambda item: item[1], reverse=True))
    for key in sorted_dict:
        file.write(key + " - " + str(sorted_dict[key]) + "\n")


class SummaryStatsOperator(BaseOperator):
    template_fields = ("ner_counters", "translate_stats", "output_dir")

    def __init__(self, *, ner_counters, translate_stats, summary_filename, output_dir=".", fs_conn_id="fs_default",
                 **kwargs):
        super().__init__(**kwargs)
        self.fs_conn_id = fs_conn_id
        self.ner_counters = ner_counters
        self.translate_stats = translate_stats
        #        self.lang_count = lang_count
        #        self.translated_count = translated_count
        self.summary_filename = summary_filename
        self.output_dir = output_dir

    def execute(self, context):
        hook = FSHook(self.fs_conn_id)
        basepath = hook.get_path()
        full_path = os.path.join(basepath, self.output_dir, self.summary_filename)
        ne_category_counter = self.ner_counters[0]
        ne_counter = self.ner_counters[1]
        lang_count = self.translate_stats["lang_count"]
        translated_count = self.translate_stats["translated_count"]
        en_lang_count = 0
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        if "en" in lang_count:
            en_lang_count = lang_count["en"]
        try:
            with open(full_path, "w") as file:
                file.write("Summary statistics of dag run:\n")
                file.write("==============================\n\n")
                file.write("Correctly translated files:" + str(translated_count['successfully']) + " of " + str(
                    translated_count['unsuccessfully'] + translated_count['successfully'] - en_lang_count) + "\n")
                file.write("\nNumber of files by language:\n")
                write_dict_to_file(lang_count, file)
                file.write("\nNumber of named entites by occurence:\n")
                write_dict_to_file(ne_counter, file)
                file.write("\nNumber of named entites category by occurence:\n")
                write_dict_to_file(ne_category_counter, file)

        except IOError as e:
            raise Exception(f"Couldn't open {full_path} ({str(e)})!")