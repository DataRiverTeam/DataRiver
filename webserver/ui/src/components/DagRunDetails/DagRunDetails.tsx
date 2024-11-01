import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { Link } from "react-router-dom";

import { TDagRun } from "../../types/airflow";

type TDagRunResponse = TDagRun & { status: number };

function DagRunDetails() {
    let { dagId, runId } = useParams();
    let [dagRun, setDagRun] = useState<TDagRun | null>(null);
    let [errorMessage, setErrorMessage] = useState("");

    async function getData() {
        try {
            const response = await fetch(`/api/dags/${dagId}/dagruns/${runId}`);
            const json: TDagRunResponse = await response.json();
            const { status: statusCode, ...dagRunData } = json;

            if (!statusCode.toString().startsWith("2")) {
                throw new Error(
                    `There was an error when handling request. Status code: ${statusCode}`
                );
            }

            setDagRun(dagRunData);
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            }
        }
    }

    useEffect(() => {
        getData();
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
        </>
    );
}

export default DagRunDetails;
