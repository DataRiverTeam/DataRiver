import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";

function DagTrigger() {
    const [conf, setConf] = useState<string>("{}");
    const { dagId } = useParams();
    const navigate = useNavigate();

    let handleSubmit = async () => {
        try {
            let response = await fetch(`/api/dags/${dagId}/dagRuns`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conf: JSON.parse(conf),
                }),
            });

            if (response.status.toString() !== "200") {
                throw new Error(
                    `Couldn't trigger a new DAG run. Status code ${response.status}`
                );
            }

            navigate(`/dags/${dagId}`);
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            }
        }
    };

    let handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        setConf(e.currentTarget.value);
    };

    return (
        <>
            <Link to={".."} relative="path">
                Back
            </Link>
            <h1> {dagId} </h1>
            <h2> Trigger a new DAG run</h2>
            {/* <CodeBlock code="" editable onInput={handleKey} /> */}
            <label>Configuration</label>
            <textarea
                name="conf"
                style={{ display: "block" }}
                value={conf}
                onChange={handleInput}
            />
            <button onClick={handleSubmit}> Confirm </button>
        </>
    );
}

export default DagTrigger;
