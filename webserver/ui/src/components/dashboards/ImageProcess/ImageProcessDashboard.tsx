import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import Tooltip from "@mui/material/Tooltip";
import RefreshIcon from "@mui/icons-material/Refresh";
import Paper from "@mui/material/Paper";

import BackButton from "../../BackButton/BackButton";
import Button from "../../Button/Button";
import DagRunsList from "../../DagRunsList/DagRunsList";

import { TDagRunWithParent } from "../../../utils/dags";
import { ApiClient, TDagRunsCollectionResponse } from "../../../utils/api";
import { TDagRunFilterFields } from "../../../utils/dags";
import DagRunFilterForm from "../../DagRunFilterForm/DagRunFilterForm";

import s from "./ImageProcessDashboard.module.css";

const client = new ApiClient();

const dagId = "image_process";

function ImageProcessingDashboard() {
    let [dagRuns, setDagRuns] = useState<TDagRunWithParent[]>([]);
    let [areDagRunsLoading, setAreDagRunsLoading] = useState(true);

    let form = useForm<TDagRunFilterFields>();
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
        const { watch } = form;

        let subscription = watch((values) => {
            const computedFilters = [];
            const state = values.state;
            const dagRunId = values.dagRunId;
            const parentDagRunId = values.parentDagRunId;

            if (state && state?.length > 0) {
                computedFilters.push(
                    (item: TDagRunWithParent) => item.state === state
                );
            }
            if (typeof dagRunId === "string" && dagRunId?.length > 0) {
                computedFilters.push((item: TDagRunWithParent) =>
                    item.dag_run_id.includes(dagRunId)
                );
            }
            if (
                typeof parentDagRunId === "string" &&
                parentDagRunId?.length > 0
            ) {
                computedFilters.push((item: TDagRunWithParent) =>
                    item.conf?.parent_dag_run_id.includes(parentDagRunId)
                );
            }

            setFilters(computedFilters);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <>
            <BackButton to="/" />
            <h1>Processing images</h1>
            <p>Monitor processing of the articles.</p>

            <h2> Active DAGs</h2>
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
                    <DagRunFilterForm form={form} />
                    <DagRunsList
                        dagRuns={dagRuns.filter((item) => {
                            return filters.reduce(
                                (acc, filter) => acc && filter(item),
                                true
                            );
                        })}
                    />
                </Paper>
            )}
        </>
    );
}

export default ImageProcessingDashboard;
