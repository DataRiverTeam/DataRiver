import { TDagRun, TDagState } from "../../types/airflow";

import { useState } from "react";

import s from "./DagRunsList.module.css";
import Row from "./components/Row";

type TDagRunsListProps = {
    dagRuns: TDagRun[];
};

const NO_ITEMS_MSG = "No DAG runs to display.";

const states: TDagState[] = ["queued", "running", "success", "failed"];

function DagRunsList({ dagRuns }: TDagRunsListProps) {
    let [selectedState, setSelectedState] = useState<"" | TDagState>("");

    return (
        <>
            <fieldset>
                <legend>Filters</legend>
                <select
                    onChange={(e) => {
                        setSelectedState(e.target.value as "" | TDagState);
                    }}
                >
                    <option value={""}> - </option>
                    {states.map((state) => (
                        <option key={`option-${state}`} value={state}>
                            {state}
                        </option>
                    ))}
                </select>
            </fieldset>
            {dagRuns?.length ? (
                <div className={s.dagruns}>
                    <div className={s.dagrunsCell}>DAG run ID</div>
                    <div className={s.dagrunsCell}>Start date</div>
                    <div className={s.dagrunsCell}>State</div>
                    <div className={s.dagrunsCell}>Conf</div>
                    {dagRuns
                        .filter(
                            (dagRun) =>
                                selectedState === "" ||
                                dagRun.state === selectedState
                        )
                        .map((dagRun) => {
                            return (
                                <Row key={dagRun.dag_run_id} dagRun={dagRun} />
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
