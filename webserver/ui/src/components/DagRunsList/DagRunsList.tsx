import { TDagRun } from "../../types/airflow";

import { useState, Fragment } from "react";

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
            {dagRuns?.length ? (
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
                            <Fragment key={dagRun.dag_run_id}>
                                <div className={s.dagrunsCell}>
                                    <Link to={`${dagRun.dag_run_id}`}>
                                        {dagRun.dag_run_id}
                                    </Link>
                                </div>
                                <div className={s.dagrunsCell}>
                                    {dagRun.start_date}
                                </div>
                                <div
                                    className={clsx(s.dagrunsCell, s.status, {
                                        [s.statusSuccess]:
                                            dagRun.state === "success",
                                        [s.statusFailed]:
                                            dagRun.state === "failed",
                                        [s.statusRunning]:
                                            dagRun.state === "running",
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
                            </Fragment>
                        );
                    })}
                </div>
            ) : (
                <p>{NO_ITEMS_MSG}</p>
            )}
        </>
    );
}

export default DagRunsList;
