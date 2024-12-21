import { useState, useEffect } from "react";

import { Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import Button from "../../Button/Button";
import { TDagRun } from "../../../types/airflow";
import { ApiClient, TDagRunsCollectionResponse } from "../../../utils/api";
import BackButton from "../../BackButton/BackButton";
import Table from "../../Table/Table";

const client = new ApiClient();

const dagId = "ner_transform_dataset";

function NerTransformDashboard() {
    let [dagRuns, setDagRuns] = useState<TDagRun[]>([]);
    let [areDagRunsLoading, setAreDagRunsLoading] = useState(true);

    let fetchDagRuns = async () => {
        try {
            const json: TDagRunsCollectionResponse = await client.getDagRuns(
                dagId
            );

            setDagRuns(
                json.dag_runs.sort((a, b) => {
                    return b.start_date.localeCompare(a.start_date);
                })
            );
        } catch (error) {
            console.error(error);
        } finally {
            setAreDagRunsLoading(false);
        }
    };

    useEffect(() => {
        fetchDagRuns();
    }, []);

    return (
        <>
            <BackButton to="/" />
            <h1>NER - batching files</h1>
            <p>
                Monitor the process of splitting uploaded JSON files into
                smaller batches.
            </p>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                <h2>Recent DAG runs</h2>
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
                <Table rows={dagRuns} />
            )}
        </>
    );
}

export default NerTransformDashboard;
