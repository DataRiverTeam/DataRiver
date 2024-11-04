import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import { TDagRun, TTaskInstance } from "../../types/airflow";
import CodeBlock from "../CodeBlock/CodeBlock";

import s from "./DagRunDetails.module.css";

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
            <h1> {runId} </h1>
            {errorMessage ? (
                errorMessage
            ) : dagRun ? (
                <>
                    <p>start date - {dagRun.start_date}</p>
                    {dagRun?.end_date ? (
                        <p>end date - {dagRun.end_date}</p>
                    ) : null}
                    <p>state - {dagRun.state}</p>
                </>
            ) : null}
            <h2>Tasks</h2>
            {tasksErrorMessage ? (
                tasksErrorMessage
            ) : (
                <table className={s.tasks}>
                    <thead>
                        <tr>
                            <td>Task ID</td>
                            <td>Map index</td>
                            <td>State</td>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => {
                            return (
                                <tr key={task.task_id}>
                                    <td> {task.task_id}</td>
                                    <td> {task.map_index}</td>
                                    <td> {task.state || "-"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            {dagRun ? (
                <>
                    <h2>Configuration</h2>
                    <CodeBlock code={JSON.stringify(dagRun.conf, null, 2)} />
                </>
            ) : null}
        </>
    );
}

export default DagRunDetails;
