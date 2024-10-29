export type TDag = {
    dag_display_name: string;
    dag_id: string;
    default_view: string;
    description: null;
    file_token: string;
    fileloc: string;
    has_import_errors: boolean;
    has_task_concurrency_limits: boolean;
    is_active: boolean;
    is_paused: boolean;
    is_subdag: boolean;
    last_parsed_time: string;
    max_active_runs: number;
    max_active_tasks: number;
    max_consecutive_failed_dag_runs: number;
    owners: string[];
    pickle_id: null;
    root_dag_id: null;
    schedule_interval: null;
    scheduler_lock: null;
    tags: string[];
    timetable_description: string;
};

export type TDagRunCollection = {
    dag_runs: TDagRun[];
    total_entries: number;
};

export type TDagRun = {
    conf: {
        [key: string]: boolean | number | string | [] | object;
    };
    dag_id: string;
    dag_run_id: string;
    data_interval_end: string;
    data_interval_start: string;
    end_date: string;
    external_trigger: boolean;
    last_scheduling_decision: string;
    logical_date: string;
    note: string;
    run_type: string;
    start_date: string;
    state: string;
};
