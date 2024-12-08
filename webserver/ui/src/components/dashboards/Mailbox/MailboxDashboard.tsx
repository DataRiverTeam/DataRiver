import { useState, useEffect } from "react";
import { TDagRun } from "../../../types/airflow";
import { ApiClient, TDagRunsCollectionResponse } from "../../../utils/api";
import DagRunsList from "../../DagRunsList/DagRunsList";
import FileUploadForm from "../../FileUploadForm/FileUploadForm";
import CodeBlock from "../../CodeBlock/CodeBlock";
import { exampleNerJson } from "../../../utils/consts";
import DialogWindow from "../../DialogWindow/DialogWindow";
import BackButton from "../../BackButton/BackButton";

const client = new ApiClient();

const dagId = "ner_mailbox";
const mailboxUploadPath = "/map/";

function MailboxDashboard() {
    let [dagRuns, setDagRuns] = useState<TDagRun[]>([]);
    let [areDagRunsLoading, setAreDagRunsLoading] = useState(true);
    let [isExampleVisible, setIsExampleVisible] = useState(false);

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
            <DialogWindow
                title="Example file"
                open={isExampleVisible}
                handleClose={() => {
                    setIsExampleVisible(false);
                }}
            >
                <CodeBlock code={JSON.stringify(exampleNerJson, null, 2)} />
            </DialogWindow>
            <h1>NER - file upload</h1>
            <p>
                Import JSON files containing articles (
                <a
                    href="#"
                    onClick={() => {
                        setIsExampleVisible(true);
                    }}
                >
                    see example file
                </a>
                ) to process them.
            </p>

            <h2> Upload files</h2>
            <FileUploadForm directory={mailboxUploadPath} />

            <h2> DAGs status </h2>
            {areDagRunsLoading ? (
                "Loading DAG runs..."
            ) : (
                <DagRunsList dagId={dagId} dagRuns={dagRuns} />
            )}
        </>
    );
}

export default MailboxDashboard;
