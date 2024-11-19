import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { TDagRun, TDagRunsCollection } from "../../types/airflow";

import DagRunsList from "../DagRunsList/DagRunsList";

import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BackButton from "../BackButton/BackButton";

type TDagRunResponse = TDagRunsCollection & { status: number };

function DagDetails() {
    let [dagRuns, setDagRuns] = useState<TDagRun[]>([]);
    let [errorMessage, setErrorMessage] = useState("");
    let [isLoading, setIsLoading] = useState(true);
    let { dagId } = useParams();

    let fetchDagRuns = async () => {
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
        fetchDagRuns();
    }, []);

    return (
        <>
            {dagId ? (
                <>
                    <BackButton to={".."} relative="path" />
                    <h1> {dagId} </h1>

                    {isLoading ? (
                        "Loading..."
                    ) : errorMessage ? (
                        errorMessage
                    ) : (
                        <>
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
                            <DagRunsList
                                heading={<h2> DAG runs </h2>}
                                dagRuns={dagRuns}
                            />
                        </>
                    )}
                </>
            ) : (
                <p> Missing parameter: DAG ID.</p>
            )}
        </>
    );
}

export default DagDetails;
