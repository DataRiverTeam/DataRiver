import { useState, useEffect } from "react";
import LinkButton from "../../LinkButton/LinkButton";
import { TDagRun } from "../../../types/airflow";
import { ApiClient, TDagRunsCollectionResponse } from "../../../utils/api";
import { triggerMailboxConf } from "../../../utils/consts";

// import DagRunsList from "../../DagRunsListOld/DagRunsList";
import MessageBox from "../../MessageBox/MessageBox";
import FileUploadForm from "../../FileUploadForm/FileUploadForm";
import CodeBlock from "../../CodeBlock/CodeBlock";
import { exampleNerJson } from "../../../utils/consts";
import DialogWindow from "../../DialogWindow/DialogWindow";
import BackButton from "../../BackButton/BackButton";
import Button from "../../Button/Button";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import s from "../dashboards.module.css";

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

function NerMailboxDashboard() {
    let [isLoading, setIsLoading] = useState<boolean>(true);
    let [isExampleVisible, setIsExampleVisible] = useState(false);
    let [recentActiveDag, setRecentActiveDag] = useState<TDagRun | null>(null);
    let [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);

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
            <h1>NER - mailbox</h1>
            <p>
            Welcome to the Named Entity Recognition (NER) mailbox dashboard. Here, you can activate the sensor to begin detecting uploaded files seamlessly.
            </p>
            <p>
            Named Entity Recognition is applied to the articles extracted from the detected files, providing valuable insights into the entities present in the content.
            </p>
            <p>
            After uploading a file, a button will appear to guide you to the next dashboard for further processing details
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
                                    fetchDagRuns();
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
                    className={s.example}
                    onClick={() => {
                        setIsExampleVisible(true);
                    }}
                >
                    click to see example file
                </a>
                )
            </p>

            <FileUploadForm
                directory={mailboxUploadPath}
                onSuccess={() => {
                    alert("Files uploaded sucessfully!");
                    setIsFileUploaded(true)
                    fetchDagRuns();
                }}
            />

            {isFileUploaded && recentActiveDag ? (
            <div className={s.cellAlignCenter}>
                <LinkButton
                    className={s.nextButton}
                    to={`../ner_transform_dataset?parentDagRunId=${encodeURIComponent(recentActiveDag!.dag_run_id)}&isRedirect=true`}
                    relative="path"
                >
                    Track processing &nbsp;<ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                </LinkButton>
            </div>
            ) : <></>}
        </>
    );
}

export default NerMailboxDashboard;
