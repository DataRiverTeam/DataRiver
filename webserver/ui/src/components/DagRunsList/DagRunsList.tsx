import { TDagRun } from "../../types/airflow";

import { useState } from "react";
import { Link } from "react-router-dom";

import clsx from "clsx";

import s from "./DagRunsList.module.css";

type TDagRunsListProps = {
    dagRuns: TDagRun[];
};

const NO_ITEMS_MSG = "No DAG runs to display.";

function DagRunsList({ dagRuns }: TDagRunsListProps) {
    return (
        <>
            {dagRuns.length ? (
                <div className={s.dagruns}>
                    <div className={s.dagrunsCell}>DAG run ID</div>
                    <div className={s.dagrunsCell}>Start date</div>
                    <div className={s.dagrunsCell}>State</div>
                    <div className={s.dagrunsCell}>Conf</div>
                    {dagRuns.map((dagRun) => {
                        let [confExpanded, setConfExpanded] =
                            useState<boolean>(false);

                        let toggleConfExpanded = () => {
                            setConfExpanded(!confExpanded);
                        };

                        return (
                            <>
                                <div className={s.dagrunsCell}>
                                    <Link to={`${dagRun.dag_run_id}`}>
                                        {dagRun.dag_run_id}
                                    </Link>
                                </div>
                                <div className={s.dagrunsCell}>
                                    {dagRun.start_date}
                                </div>
                                <div className={s.dagrunsCell}>
                                    {dagRun.state}
                                </div>
                                <div className={s.dagrunsCell}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <button onClick={toggleConfExpanded}>
                                            Display conf
                                        </button>
                                    </div>
                                </div>
                                <div
                                    className={clsx(
                                        s.dagrunConfCell,
                                        s.dagrunConfCellActive
                                    )}
                                    style={{
                                        display: confExpanded
                                            ? "initial"
                                            : "none",
                                    }}
                                >
                                    <pre className="code">
                                        {JSON.stringify(dagRun.conf, null, 2)}
                                    </pre>
                                </div>
                            </>
                        );
                    })}
                </div>
            ) : (
                { NO_ITEMS_MSG }
            )}
        </>
    );
}

export default DagRunsList;
