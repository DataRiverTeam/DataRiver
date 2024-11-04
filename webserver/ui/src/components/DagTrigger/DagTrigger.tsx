import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import clsx from "clsx";

import Button from "@mui/material/Button";

import s from "./DagTrigger.module.css";

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
            <div className={s.triggerFormWrapper}>
                <label>Configuration</label>
                <textarea
                    name="conf"
                    style={{
                        display: "block",
                        width: "100%",
                        resize: "vertical",
                    }}
                    value={conf}
                    onChange={handleInput}
                    className="code"
                />
                <Button
                    onClick={handleSubmit}
                    variant="text"
                    className={clsx(s.submitButton)}
                >
                    Confirm
                </Button>
            </div>
            {/* <CodeBlock code="" editable onInput={handleKey} /> */}
        </>
    );
}

export default DagTrigger;
