import { useState } from "react";
import { Link } from "react-router-dom";
import { TDagRun } from "../../../types/airflow";
import clsx from "clsx";

import s from "../DagRunsList.module.css";

type TRowProps = {
    dagRun: TDagRun;
};

function Row({ dagRun }: TRowProps) {
    let [confExpanded, setConfExpanded] = useState<boolean>(false);

    let toggleConfExpanded = () => {
        setConfExpanded(!confExpanded);
    };

    return (
        <>
            <div className={s.dagrunsCell}>
                <Link to={`${dagRun.dag_run_id}`}>{dagRun.dag_run_id}</Link>
            </div>
            <div className={s.dagrunsCell}>{dagRun.start_date}</div>
            <div
                className={clsx(s.dagrunsCell, s.status, {
                    [s.statusSuccess]: dagRun.state === "success",
                    [s.statusFailed]: dagRun.state === "failed",
                    [s.statusRunning]: dagRun.state === "running",
                })}
            >
                {dagRun.state}
            </div>
            <div className={s.dagrunsCell}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <button onClick={toggleConfExpanded}>Display conf</button>
                </div>
            </div>
            <div
                className={clsx(s.dagrunConfCell, s.dagrunConfCellActive)}
                style={{
                    display: confExpanded ? "initial" : "none",
                }}
            >
                <pre className="code">
                    {JSON.stringify(dagRun.conf, null, 2)}
                </pre>
            </div>
        </>
    );
}

export default Row;
