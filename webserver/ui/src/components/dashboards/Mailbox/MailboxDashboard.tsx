import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { TDagRun } from "../../../types/airflow";
import { ApiClient, TDagRunsCollectionResponse } from "../../../utils/api";
import { triggerMailboxConf } from "../../../utils/consts";

// import DagRunsList from "../../DagRunsList/DagRunsList";
import MessageBox from "../../MessageBox/MessageBox";
import FileUploadForm from "../../FileUploadForm/FileUploadForm";
import CodeBlock from "../../CodeBlock/CodeBlock";
import { exampleNerJson } from "../../../utils/consts";
import DialogWindow from "../../DialogWindow/DialogWindow";
import BackButton from "../../BackButton/BackButton";
import Button from "../../Button/Button";

const client = new ApiClient();

const dagId = "ner_mailbox";
const mailboxUploadPath = "/map/";

async function triggerMailbox(onSuccess: () => any | null) {
    try {
        await client.triggerDag({ conf: triggerMailboxConf }, dagId, () => {
            alert("DAG triggered sucessfully. Refreshing...");
        });

        if (onSuccess) {
            onSuccess();
        }
    } catch (error) {
        if (error instanceof Error) {
            alert(error.message);
        }
        console.error(error);
    }
}

function MailboxDashboard() {
    let [isLoading, setIsLoading] = useState<boolean>(true);
    let [isExampleVisible, setIsExampleVisible] = useState(false);
    let [recentActiveDag, setRecentActiveDag] = useState<TDagRun | null>(null);

    const navigate = useNavigate();

    let fetchDagRuns = async () => {
        try {
            const json: TDagRunsCollectionResponse = await client.getDagRuns(
                dagId
            );

            const dagRuns = json.dag_runs;

            // setDagRuns(dagRuns);

            let activeDag =
                dagRuns
                    .filter((item) => item.state === "running")
                    .sort((a, b) => {
                        return a.start_date.localeCompare(b.start_date);
                    })[0] || null;

            setRecentActiveDag(activeDag);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        } finally {
            // setAreDagRunsLoading(false);
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
                Upload the files in order to perform Named-entity recognition.
            </p>
            <h2> Sensor status </h2>
            {!isLoading ? (
                recentActiveDag ? (
                    <p>
                        The file sensor is{" "}
                        <span style={{ color: "lime", fontWeight: "bold" }}>
                            active
                        </span>
                        .
                    </p>
                ) : (
                    <div>
                        <MessageBox
                            text="Warning: There is no active file sensor at the moment. Please activate it in order to process the files."
                            variant="warning"
                        />
                        <Button
                            onClick={() => {
                                triggerMailbox(() => {
                                    navigate(0);
                                });
                            }}
                        >
                            Activate file sensor
                        </Button>
                    </div>
                )
            ) : (
                <p>Waiting for the server response...</p>
            )}

            <h2> Upload files</h2>
            <p>
                Import JSON files containing articles to process them. <br />(
                <a
                    href="#"
                    onClick={() => {
                        setIsExampleVisible(true);
                    }}
                >
                    see example file
                </a>
                )
            </p>

            <FileUploadForm
                directory={mailboxUploadPath}
                onSuccess={() => {
                    alert("Files uploaded sucessfully!");
                    navigate(0);
                }}
            />

            {/* <h2> DAGs status </h2>
            {areDagRunsLoading ? (
                "Loading DAG runs..."
            ) : (
                <DagRunsList dagId={dagId} dagRuns={dagRuns} />
            )} */}
        </>
    );
}

export default MailboxDashboard;
