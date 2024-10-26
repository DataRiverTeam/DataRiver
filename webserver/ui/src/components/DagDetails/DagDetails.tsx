import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function DagDetails() {
    let [dagRuns, setDagRuns] = useState([]);
    let [errorMessage, setErrorMessage] = useState("");
    let { dagId } = useParams();

    let getDag = () => {
        fetch(`/api/dagruns/${dagId}`)
            .then((res) => res.json())
            .then((json) => {
                console.log(json);
                setDagRuns(json.dag_runs);
            })
            .catch((err) => {
                console.log(err);
                setErrorMessage(err);
            });
    };

    useEffect(() => {
        getDag();
    }, []);

    return (
        <>
            {errorMessage
                ? errorMessage
                : dagRuns.length
                ? dagRuns.map((dagRun) => {
                      return <pre> {JSON.stringify(dagRun, null, 1)} </pre>;
                  })
                : "Loading..."}
        </>
    );
}

export default DagDetails;
