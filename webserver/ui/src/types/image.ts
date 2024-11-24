export type TImageDetails = {
    id: string;
    hash: {
        [key: string]: string;
    };
    description: string;
    thumbnail: string;
    image_path: string;
    metadata: { tag: string; value: string }[];
    dag_processed_date: string;
    dag_run_id: string;
    dag_start_date: string;
};
