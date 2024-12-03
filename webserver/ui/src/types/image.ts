import {TDagsInfo} from "./airflow.ts";

export type TImageDetails = {
    id: string;
    hash: {
        [key: string]: string;
    };
    description: string;
    thumbnail: string;
    image_path: string;
    metadata: { tag: string; value: string }[];
    processed_date: string;
    // Hardcoding is bag. I know
    dags_info: {map_file: TDagsInfo, ner_single_file: TDagsInfo};
};
