import { useState, useEffect, FormEventHandler } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";

import Tooltip from "@mui/material/Tooltip";
import RefreshIcon from "@mui/icons-material/Refresh";
import Paper from "@mui/material/Paper";

import BackButton from "../../BackButton/BackButton";
import Button from "../../Button/Button";
import Table from "../../Table/Table";
import DagRunFilterForm from "../../DagRunFilterForm/DagRunFilterForm";

import { TDagRunWithParent } from "../../../utils/dags";
import { ApiClient, TDagRunsCollectionResponse } from "../../../utils/api";
import { TDagRunFilterFields } from "../../../utils/dags";

import { getDashboardListCells, computeFilters } from "./helpers";
import { isValidDagRunState } from "../../../types/airflow";

import s from "../dashboards.module.css";

const client = new ApiClient();

const dagId = "image_process";

const headerCells = [
    "DAG run ID",
    "Start date",
    "State",
    "DAG run Details",
    "Results",
];

function ImageProcessingDashboard() {
    let [searchParams, setSearchParams] = useSearchParams();
    let [dagRuns, setDagRuns] = useState<TDagRunWithParent[]>([]);
    let [areDagRunsLoading, setAreDagRunsLoading] = useState(true);

    let form = useForm<TDagRunFilterFields>();
    const { setValue, getValues } = form;

    let [filters, setFilters] = useState<
        ((dagRun: TDagRunWithParent) => boolean)[]
    >([]);

    let fetchDagRuns = async () => {
        try {
            const json: TDagRunsCollectionResponse = await client.getDagRuns(
                dagId
            );

            setDagRuns(json.dag_runs as TDagRunWithParent[]);
        } catch (error) {
            console.error(error);
        } finally {
            setAreDagRunsLoading(false);
        }
    };

    useEffect(() => {
        fetchDagRuns();
    }, []);

    useEffect(() => {
        const searchParamState = searchParams.get("state");
        if (searchParamState && isValidDagRunState(searchParamState)) {
            setValue("state", searchParamState);
        }
        const searchDagRunId = searchParams.get("dagRunId");
        if (searchDagRunId) {
            setValue("dagRunId", searchDagRunId);
        }
        const searchParentDagRunId = searchParams.get("parentDagRunId");
        if (searchParentDagRunId) {
            setValue("parentDagRunId", searchParentDagRunId);
        }

        setFilters(computeFilters(getValues()));
    }, []);

    const onSubmitFn: FormEventHandler = (e) => {
        e.preventDefault();
        setSearchParams(new URLSearchParams(getValues()).toString());
        setFilters(computeFilters(getValues()));
    };

    return (
        <>
            <BackButton to="/" />
            <h1>Processing images</h1>
            <p>Monitor processing of the articles.</p>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                <h2> Recent DAG runs</h2>
                <Tooltip title="Refresh DAG runs">
                    <span>
                        <Button
                            onClick={fetchDagRuns}
                            disabled={areDagRunsLoading}
                        >
                            <RefreshIcon />
                        </Button>
                    </span>
                </Tooltip>
            </div>
            {areDagRunsLoading ? (
                "Loading DAG runs..."
            ) : (
                <Paper className={s.listContainer}>
                    <DagRunFilterForm form={form} onSubmit={onSubmitFn} />
                    <Table
                        header={headerCells}
                        rows={dagRuns
                            .filter((item) => {
                                return filters.reduce(
                                    (acc, filter) => acc && filter(item),
                                    true
                                );
                            })
                            .map(getDashboardListCells)}
                    />
                </Paper>
            )}
        </>
    );
}

export default ImageProcessingDashboard;
