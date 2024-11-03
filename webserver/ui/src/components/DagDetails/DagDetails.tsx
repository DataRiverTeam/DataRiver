import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { TDagRun, TDagRunCollection } from "../../types/airflow";

import DagRunsList from "../DagRunsList/DagRunsList";

import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

type TDagRunResponse = TDagRunCollection & { status: number };

function DagDetails() {
    let [dagRuns, setDagRuns] = useState<TDagRun[]>([]);
    let [errorMessage, setErrorMessage] = useState("");
    let [isLoading, setIsLoading] = useState(true);
    let { dagId } = useParams();

    let getDag = async () => {
        try {
            const response = await fetch(`/api/dags/${dagId}/dagruns`);
            const json: TDagRunResponse = await response.json();

            if (!json?.status.toString().startsWith("2")) {
                throw new Error(
                    `There was an error when handling request. Status code: ${json.status}`
                );
            }

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
            <Link to={".."} relative="path">
                Back
            </Link>

            <h1> {dagId} </h1>
            <h2> DAG runs </h2>
            <Link relative="path" to={"./trigger"}>
                <Tooltip title={"Trigger a DAG run"}>
                    <IconButton
                        aria-label="trigger-dagrun"
                        sx={{ color: "white" }}
                    >
                        <PlayArrowIcon />
                    </IconButton>
                </Tooltip>
            </Link>

            {isLoading ? (
                "Loading..."
            ) : errorMessage ? (
                errorMessage
            ) : (
                <DagRunsList dagRuns={dagRuns} />
            )}
        </>
    );
}

export default DagDetails;
