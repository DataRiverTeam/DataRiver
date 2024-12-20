import { useState, useEffect } from "react";
import { TDagRun } from "../../../types/airflow";
import { ApiClient, TDagRunsCollectionResponse } from "../../../utils/api";
import BackButton from "../../BackButton/BackButton";
import Tooltip from "@mui/material/Tooltip";
import RefreshIcon from "@mui/icons-material/Refresh";
import Button from "../../Button/Button";
import DagRunsList from "../../DagRunsList/DagRunsList";

const client = new ApiClient();

const dagId = "image_process";
function ImageProcessingDashboard() {
    let [dagRuns, setDagRuns] = useState<TDagRun[]>([]);
    let [areDagRunsLoading, setAreDagRunsLoading] = useState(true);

    let fetchDagRuns = async () => {
        try {
            const json: TDagRunsCollectionResponse = await client.getDagRuns(
                dagId
            );

            setDagRuns(json.dag_runs);
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
                <DagRunsList dagRuns={dagRuns} />
            )}
        </>
    );
}

export default ImageProcessingDashboard;
