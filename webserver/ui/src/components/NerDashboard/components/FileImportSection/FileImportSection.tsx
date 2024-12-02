import { useState, useEffect } from "react";

import Tooltip from "@mui/material/Tooltip";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import DagRunsList from "../../../DagRunsList/DagRunsList";
import { TDagRun } from "../../../../types/airflow";
import { ApiClient } from "../../../../utils/api";
import LinkButton from "../../../LinkButton/LinkButton";

const DAG_NER_IMPORT_NAME = "mailbox";
const client = new ApiClient();
function FileImportSection() {
    const [dagRuns, setDagRuns] = useState<TDagRun[]>([]);

    let fetchDagRuns = async () => {
        try {
            const runs = await client.getDagRuns(DAG_NER_IMPORT_NAME);
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
            <h2> Importing files </h2>

            <Tooltip title={"Trigger a file sensor"}>
                <LinkButton relative="path" to={"./trigger"}>
                    <PlayArrowIcon />
                </LinkButton>
            </Tooltip>

            <h3> DAG runs </h3>
            <DagRunsList dagId={DAG_NER_IMPORT_NAME} dagRuns={dagRuns} />
        </>
    );
}

export default FileImportSection;
