import { TDagRun } from "../types/airflow";

import { TDagRunFilterFields } from "./dags";
import { TDagRunWithParent } from "./dags";

import s from "../components/dashboards/dashboards.module.css";

export function getStatusStyleClass(dagRun: TDagRun) {
    switch (dagRun.state) {
        case "success":
            return s.cellStatusSuccess;
        case "running":
            return s.cellStatusRunning;
        case "failed":
            return s.cellStatusFailed;
        case "queued":
            return s.cellStatusQueued;
        default:
            return null;
    }
}

export function computeFilters(values: TDagRunFilterFields) {
    const computedFilters = [];
    const filterState = values.state;
    const filterDagRunId = values.dagRunId;
    const filterParentDagRunId = values.parentDagRunId;

    if (filterState && filterState?.length > 0) {
        computedFilters.push(
            (item: TDagRunWithParent) => item.state === filterState
        );
    }
    if (typeof filterDagRunId === "string" && filterDagRunId?.length > 0) {
        computedFilters.push((item: TDagRunWithParent) =>
            item.dag_run_id.includes(filterDagRunId)
        );
    }
    if (
        typeof filterParentDagRunId === "string" &&
        filterParentDagRunId?.length > 0
    ) {
        computedFilters.push(
            (item: TDagRunWithParent) =>
                !!item.conf?.parent_dag_run_id &&
                item.conf?.parent_dag_run_id.includes(filterParentDagRunId)
        );
    }

    return computedFilters;
}

export function compareStartDateDesc(a: TDagRun, b: TDagRun) {
    return b.start_date.localeCompare(a.start_date);
}

export function notAllSuccess(dagRuns: TDagRunWithParent[]){
    return dagRuns.some(dagRun => dagRun.state != "success");
}
