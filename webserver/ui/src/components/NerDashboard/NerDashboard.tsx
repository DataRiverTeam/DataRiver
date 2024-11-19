import { useState, useEffect } from "react";

import FileUploadForm from "../FileUploadForm/FileUploadForm";
import BackButton from "../BackButton/BackButton";
import ProcessedFilesSection from "./components/ProcessedFiles/ProcessedFiles";
import { TDagRun } from "../../types/airflow";

import { ApiClient } from "../../utils/api";

const DAG_NER_PROCESSING_NAME = "ner_single_file";

const client = new ApiClient();

function NerDashboard() {
    let [_dagRuns, setDagRuns] = useState<TDagRun[]>([]);
    // let [errorMessage, setErrorMessage] = useState("");

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
            <BackButton to="/" />
            <h1> Named entity recognition </h1>
            <h2> Importing files </h2>

            <FileUploadForm directory={"map"} />
            <ProcessedFilesSection />
        </>
    );
}

export default NerDashboard;
