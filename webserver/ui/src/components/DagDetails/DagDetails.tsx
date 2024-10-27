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
                      let { conf, dag_run_id, state, start_date } = dagRun;
                      //   return <pre> {JSON.stringify(dagRun, null, 2)} </pre>;
                      return (
                          <pre>
                              {JSON.stringify(
                                  [conf, dag_run_id, state, start_date],
                                  null,
                                  2
                              )}
                          </pre>
                      );
                  })
                : "Loading..."}
        </>
    );
}

export default DagDetails;
