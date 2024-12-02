import { useState, useEffect } from "react";
import { TDagRun } from "../../../types/airflow";
import { ApiClient, TDagRunsCollectionResponse } from "../../../utils/api";
import DagRunsList from "../../DagRunsList/DagRunsList";
import FileUploadForm from "../../FileUploadForm/FileUploadForm";
import CodeBlock from "../../CodeBlock/CodeBlock";
import { exampleNerJson } from "../../../utils/consts";

const client = new ApiClient();

const dagId = "mailbox";

function MailboxDashboard() {
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
            <h1>NER - file upload</h1>
            <p> Import texts in JSON </p>

            <h3> Example file schema</h3>
            <CodeBlock code={JSON.stringify(exampleNerJson, null, 2)} />
            <h2> Upload files</h2>
            <FileUploadForm />

            <h2> Active DAGs</h2>
            {areDagRunsLoading ? (
                "Loading DAG runs..."
            ) : (
                <DagRunsList dagId={dagId} dagRuns={dagRuns} />
            )}
        </>
    );
}

export default MailboxDashboard;
