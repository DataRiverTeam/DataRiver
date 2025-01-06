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

import { getDashboardListCells } from "./helpers";
import { compareStartDateDesc, computeFilters } from "../../../utils/dashboard";
import { isValidDagRunState } from "../../../types/airflow";

import s from "../dashboards.module.css";

const client = new ApiClient();

const dagId = "image_process";

const headerCells = [
    "DAG run ID",
    "Start date",
    "State",
    "Details",
    "Results",
];

const tooltips = [
    "Displays the unique identifier for each DAG run associated with the worker process.",
    "Shows the timestamp when the file splitting process for a specific DAG run began.",
    "Indicates the current status of the DAG run (\"queued\", \"running\", \"success\", \"failed\").",
    "Click to see additional information about the specific DAG run",
    "Click the arrow to view the gallery with the processing outcomes."
 ]

function ImageProcessingDashboard() {
    let [searchParams, setSearchParams] = useSearchParams();
    let [dagRuns, setDagRuns] = useState<TDagRunWithParent[]>([]);
    let [areDagRunsLoading, setAreDagRunsLoading] = useState(true);
    let [isRedirect, setIsRedirect] = useState(false);
    let [initParentDag, setInitParentDag] = useState<string|null>("");

    const form = useForm<TDagRunFilterFields>();
    const { setValue, getValues } = form;
    let [filters, setFilters] = useState<
        ((dagRun: TDagRunWithParent) => boolean)[]
    >([]);
    let filteredDagRuns = dagRuns.filter((item) => {
        return filters.reduce(
            (acc, filter) => acc && filter(item),
            true
        );
    })

    const notAllSuccess = (dagRuns: TDagRunWithParent[]): boolean => {
        return dagRuns.some(dagRun => dagRun.state != "success");
    }

    const fetchDagRuns = async () => {
        try {
            const json: TDagRunsCollectionResponse = await client.getDagRuns(
                dagId
            );

            setDagRuns(json.dag_runs.sort(compareStartDateDesc));
        } catch (error) {
            console.error(error);
        } finally {
            setAreDagRunsLoading(false);
        }
    };

    const onSubmitFn: FormEventHandler = (e) => {
        e.preventDefault();
        setSearchParams(new URLSearchParams(getValues()).toString());
        setFilters(computeFilters(getValues()));
        setIsRedirect(initParentDag == searchParams.get("parentDagRunId"));
    };

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
        const isRedirect = searchParams.get("isRedirect");
        if (isRedirect == "true") {
            setIsRedirect(true);
            setInitParentDag(searchParentDagRunId)
        }

        setFilters(computeFilters(getValues()));
    }, []);

    useEffect(() => {
        fetchDagRuns();
    }, [])

    useEffect(() => {
        let interval: number;
        if (isRedirect && initParentDag == searchParams.get("parentDagRunId")) {
            if (filteredDagRuns.length == 0) {
                interval = setInterval(() => {
                    fetchDagRuns();
                }, 1000)
            } else if(notAllSuccess(filteredDagRuns)){
                interval = setInterval(() => {
                    fetchDagRuns();
                }, 5000)     
            }
        }
        return () => {
            if (interval) {
              clearInterval(interval);
            }
          };
    }, [dagRuns]);

    return (
        <>
            <BackButton to="/" />
            <h1>Processing images</h1>
            <p>This dashboard allows you to monitor the images processing.</p> 
            <p>It provides info about DAG run, its status, and the processing results.</p> 
            <p>You can view the results after clicking the button in the "Results" column</p>
          
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
                    { filteredDagRuns.length > 0 || !isRedirect || initParentDag != searchParams.get("parentDagRunId") ? (
                        <Table
                            header={headerCells}
                            tooltips={tooltips}
                            rows={filteredDagRuns.map(getDashboardListCells)}
                        /> 
                    ) : (
                        <p className={s.message}> Selected DAG run is not ready yet, wait few seconds </p>  
                     )
                 }
                </Paper>
            )}
        </>
    );
}

export default ImageProcessingDashboard;
