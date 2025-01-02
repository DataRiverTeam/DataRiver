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

const dagId = "image_transform_dataset";

const headerCells = [
    "DAG run ID",
    "Start date",
    "State",
    "Details",
    "Results",
    "Worker processes"
];

const tooltips = [
   "Displays the unique identifier for each DAG run associated with the file splitting process. This helps track individual processing instances.",
   "Shows the timestamp when the file splitting process for a specific DAG run began.",
   "Indicates the current status of the DAG run (\"queued\", \"running\", \"success\", \"failed\").",
   "Click to see additional information about the specific DAG run",
   "Click the arrow to view the gallery with the file processing outcomes.",
   "Click the button to navigate to the worker process DAG runs, which are invoked multiple times during file splitting to handle each segment. This provides a detailed view of each worker process run."
]

function ImageTransformDatasetDashboard() {
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
    //TODO: move fetchDagRuns to utils, since it's repeated in literally every dashboard
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
        if (filteredDagRuns.length == 0 && isRedirect && initParentDag == searchParams.get("parentDagRunId")) {
            interval = setInterval(() => {
                fetchDagRuns();
            }, 1000)
        }
        return () => {
            if (interval) {
              clearInterval(interval);
            }
          };
    }, [dagRuns]);

    let filteredDagRuns = dagRuns.filter((item) => {
        return filters.reduce(
            (acc, filter) => acc && filter(item),
            true
        );
    })

    return (
        <>
            <BackButton to="/" />
            <h1>Images - splitting files</h1>
            <p>This dashboard allows you to monitor the file splitting process. It provides detailed insights into each DAG run, its status, and the processing results. Multiple worker processes are triggered, each handling a specific segment of the split files. You can effortlessly view both the results and the details of each worker process directly from the table.</p>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                <h2>Active DAGs</h2>
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
                        />) : (
                           <p className={s.message}> Selected DAG run is not ready yet, wait few seconds </p>  
                        )
                    }
                </Paper>
            )}
        </>
    );
}

export default ImageTransformDatasetDashboard;
