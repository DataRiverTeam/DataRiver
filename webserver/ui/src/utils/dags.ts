import { TDagRun, TDagState } from "../types/airflow";

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

//used in dashboard components and in the DagRunFilterForm
export type TDagRunFilterFields = {
    state: TDagState;
    parentDagRunId: string;
    dagRunId: string;
};

export type TDagRunWithParent = TDagRun & {
    conf: TDagRun["conf"] & { parent_dag_run_id: string };
};
