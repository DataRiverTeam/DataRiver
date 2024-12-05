import { useState, useEffect } from "react";
import { TDagRun } from "../../../types/airflow";
import { ApiClient, TDagRunsCollectionResponse } from "../../../utils/api";
import DagRunsList from "../../DagRunsList/DagRunsList";
import BackButton from "../../BackButton/BackButton";

const client = new ApiClient();

const dagId = "map_file_images";

function MapImageFilesDashboard() {
    let [dagRuns, setDagRuns] = useState<TDagRun[]>([]);
    let [areDagRunsLoading, setAreDagRunsLoading] = useState(true);

    //TODO: move fetchDagRuns to utils, since it's repeated in literally every dashboard
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
            <h1>Images - batching files</h1>
            <p>
                Monitor the process of splitting uploaded images dataset into
                smaller batches.
            </p>

            <h2>TODO: MAKE LINKS TO THE BROWSER WITH QUERY WITH DAG RUN ID</h2>

            <h2> Active DAGs</h2>
            {areDagRunsLoading ? (
                "Loading DAG runs..."
            ) : (
                <DagRunsList dagId={dagId} dagRuns={dagRuns} />
            )}
        </>
    );
}

export default MapImageFilesDashboard;
