export type TDagParams = {
    [key: string]: string | number | boolean | any[] | null;
};

export type TDagTriggerBody = {
    conf?: TDagParams;
    dag_run_id?: string;
    data_interval_end?: string;
    data_interval_start?: string;
    logical_date?: string;
    note?: string;
};
