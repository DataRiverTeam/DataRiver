import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { TDagRun, TDagRunCollection } from "../../types/airflow";

import DagRunsList from "../DagRunsList/DagRunsList";

import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BackButton from "../BackButton/BackButton";
import { triggerDag } from "../../utils/dags";

type TDagRunResponse = TDagRunCollection & { status: number };

function DagDetails() {
    let [dagRuns, setDagRuns] = useState<TDagRun[]>([]);
    let [errorMessage, setErrorMessage] = useState("");
    let [isLoading, setIsLoading] = useState(true);
    let { dagId } = useParams();

    let getDag = async () => {
        try {
            const response = await fetch(`/api/dags/${dagId}/dagruns`);

            if (!response?.status.toString().startsWith("2")) {
                throw new Error(
                    `There was an error when handling request. Status code: ${response.status}`
                );
            }

            const json: TDagRunResponse = await response.json();

            setDagRuns(json.dag_runs);
        } catch (error) {
            if (error instanceof Error) setErrorMessage(error.message);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getDag();
    }, []);

    return (
        <>
            {dagId ? (
                <>
                    <BackButton />
                    <h1> {dagId} </h1>
                    <h2> DAG runs </h2>
                    <div
                        style={{
                            marginBottom: "1rem",
                            display: "flex",
                            flexDirection: "row",
                            gap: "10px",
                        }}
                    >
                        <Link relative="path" to={"./trigger"}>
                            <Tooltip title={"Trigger a DAG run"}>
                                <Button
                                    sx={{
                                        color: "white",
                                        border: "1px solid rgba(127, 127, 127, 0.3)",
                                    }}
                                    aria-label="trigger-dagrun"
                                >
                                    <PlayArrowIcon />
                                </Button>
                            </Tooltip>
                        </Link>
                    </div>
                    {isLoading ? (
                        "Loading..."
                    ) : errorMessage ? (
                        errorMessage
                    ) : (
                        <DagRunsList dagRuns={dagRuns} />
                    )}
                </>
            ) : (
                <p> Missing parameter: DAG ID.</p>
            )}
        </>
    );
}

export default DagDetails;
