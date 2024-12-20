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

export type TDagDetails = {
    dag_display_name: string;
    dag_id: string;
    default_view: string;
    description: string;
    file_token: string;
    fileloc: string;
    has_import_errors: boolean;
    has_task_concurrency_limits: boolean;
    is_active: boolean;
    is_paused: boolean;
    is_subdag: boolean;
    last_expired: string;
    last_parsed_time: string;
    last_pickled: string;
    max_active_runs: number;
    max_active_tasks: number;
    next_dagrun: string;
    next_dagrun_create_after: string;
    next_dagrun_data_interval_end: string;
    next_dagrun_data_interval_start: string;
    owners: string[];
    pickle_id: string;
    root_dag_id: string;
    schedule_interval: {
        __type: string;
        days: number;
        microseconds: number;
        seconds: number;
    };
    scheduler_lock: boolean;
    tags: {
        name: string;
    }[];
    timetable_description: string;
    catchup: boolean;
    concurrency: number;
    dag_run_timeout: {
        __type: string;
        days: number;
        microseconds: number;
        seconds: number;
    };
    dataset_expression: object;
    doc_md: string;
    end_date: string;
    is_paused_upon_creation: boolean;
    last_parsed: string;
    orientation: string;
    params: TDagParamsMap;
    render_template_as_native_obj: boolean;
    start_date: string;
    template_search_path: string[];

    timezone: string;
};

export type TDagParam = {
    __class: "airflow.models.param.Param";
    description: string | null;
    schema: { type: TDagParamSchemaType };
    value: TDagParamValue;
};

export type TDagParamSchemaType = "integer" | "string";

export type TDagParamValue = string | number;

export type TDagParamsMap = {
    [key: string]: TDagParam;
};

export type TDagRunsCollection = {
    dag_runs: TDagRun[];
    total_entries: number;
};

export type TDagState = "queued" | "running" | "success" | "failed";

export const TDagStateValues: TDagState[] = [
    "queued",
    "running",
    "success",
    "failed",
] as const;

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
    state: TDagState;
};

export type TTaskInstanceStatus =
    | "removed"
    | "scheduled"
    | "queued"
    | "running"
    | "success"
    | "restarting"
    | "failed"
    | "up_for_retry"
    | "up_for_reschedule"
    | "upstream_failed"
    | "skipped"
    | "deferred"
    | "shutdown";

export type TTaskInstance = {
    dag_id: string;
    dag_run_id: string;
    duration: number;
    end_date: string;
    execution_date: string;
    executor_config: string;
    hostname: string;
    map_index: number;
    max_tries: number;
    note: string;
    operator: string;
    pid: number;
    pool: string;
    pool_slots: number;
    priority_weight: number;
    queue: string;
    queued_when: string;
    rendered_fields: {};
    rendered_map_index: string;
    sla_miss: {
        dag_id: string;
        description: string;
        email_sent: true;
        execution_date: string;
        notification_sent: true;
        task_id: string;
        timestamp: string;
    };
    start_date: string;
    state: TTaskInstanceStatus | null;
    task_display_name: string;
    task_id: string;
    trigger: {
        classpath: string;
        created_date: string;
        id: number;
        kwargs: string;
        triggerer_id: number;
    };
    triggerer_job: {
        dag_id: string;
        end_date: string;
        executor_class: string;
        hostname: string;
        id: number;
        job_type: string;
        latest_heartbeat: string;
        start_date: string;
        state: string;
        unixname: string;
    };
    try_number: number;
    unixname: string;
};

export type TDagsInfo = {
    run_id: string;
    start_date: string;
};
