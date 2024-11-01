import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { Link } from "react-router-dom";

import { TDagRun, TTaskInstance } from "../../types/airflow";

type TDagRunResponse = TDagRun & { status: number };
type TTaskInstancesResponse = {
    task_instances: TTaskInstance[];
    status: number;
    total_entries: number;
};

function DagRunDetails() {
    let { dagId, runId } = useParams();

    let [dagRun, setDagRun] = useState<TDagRun | null>(null);
    let [errorMessage, setErrorMessage] = useState("");

    let [tasks, setTasks] = useState<TTaskInstance[]>([]);
    let [tasksErrorMessage, setTasksErrorMessage] = useState<string>("");

    async function getDagRun() {
        try {
            const response = await fetch(`/api/dags/${dagId}/dagruns/${runId}`);
            const json: TDagRunResponse = await response.json();
            const { status, ...dagRunData } = json;

            if (!status.toString().startsWith("2")) {
                throw new Error(
                    `There was an error when handling request. Status code: ${status}`
                );
            }

            setDagRun(dagRunData);
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            }
        }
    }

    async function getTasks() {
        try {
            const response = await fetch(
                `/api/dags/${dagId}/dagruns/${runId}/taskInstances`
            );
            const json: TTaskInstancesResponse = await response.json();

            if (!json.status.toString().startsWith("2")) {
                throw new Error(
                    `There was an error when handling request. Status code: ${json.status}`
                );
            }
            console.log(json.task_instances);
            setTasks(json.task_instances);
        } catch (error) {
            if (error instanceof Error) {
                setTasksErrorMessage(error.message);
            }
        }
    }

    useEffect(() => {
        getDagRun();
        getTasks();
    }, []);

    return (
        <>
            <Link to={".."} relative="path">
                Back
            </Link>
            <h1>{dagId}</h1>
            <h2> {runId} </h2>
            {errorMessage ? (
                errorMessage
            ) : (
                <pre>{JSON.stringify(dagRun, null, 2)}</pre>
            )}
            <h3>Tasks</h3>
            {tasksErrorMessage ? (
                tasksErrorMessage
            ) : (
                <pre>{JSON.stringify(tasks, null, 2)}</pre>
            )}
        </>
    );
}

export default DagRunDetails;
