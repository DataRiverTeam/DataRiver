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
    dags_info: TDagsInfo[];
};
