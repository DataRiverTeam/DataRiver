import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { TDagRun } from "../../../../types/airflow";
import { ApiClient } from "../../../../utils/api";
import DagRunsList from "../../../DagRunsList/DagRunsList";

const DAG_NER_PROCESSING_NAME = "ner_single_file";

const client = new ApiClient();

function ProcessedFilesSection() {
    const [dagRuns, setDagRuns] = useState<TDagRun[]>([]);

    let fetchDagRuns = async () => {
        try {
            const runs = await client.getDagRuns(DAG_NER_PROCESSING_NAME);
            setDagRuns(runs.dag_runs);
        } catch (error) {
            if (error instanceof Error) alert(error.message);
            else console.error(error);
        }
    };

    useEffect(() => {
        fetchDagRuns();
    }, []);

    return (
        <>
            <h2> Processed files</h2>
            <Link to="/ner/search">Go to docs browser</Link>
            <h3> DAG runs </h3>
            <DagRunsList dagId={DAG_NER_PROCESSING_NAME} dagRuns={dagRuns} />
        </>
    );
}

export default ProcessedFilesSection;
