import { useState, useEffect } from "react";
import { TDagRun } from "../../../types/airflow";
import { ApiClient, TDagRunsCollectionResponse } from "../../../utils/api";
import DagRunsList from "../../DagRunsList/DagRunsList";
import BackButton from "../../BackButton/BackButton";

const client = new ApiClient();

const dagId = "map_file";

function MapTextFilesDashboard() {
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
            <BackButton to="/" />
            <h1>NER - batching files</h1>
            <p>
                Monitor the process of splitting uploaded JSON files into
                smaller batches.
            </p>

            <h2>
                TODO: MAKE LINK TO THE BROWSER WITH QUERY SET TO map_text DAG
                RUN ID
            </h2>

            <h2> Active DAGs</h2>
            {areDagRunsLoading ? (
                "Loading DAG runs..."
            ) : (
                <DagRunsList dagId={dagId} dagRuns={dagRuns} />
            )}
        </>
    );
}

export default MapTextFilesDashboard;
