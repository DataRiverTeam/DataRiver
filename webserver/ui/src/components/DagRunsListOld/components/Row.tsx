import { Link } from "react-router-dom";
import { TDagRun } from "../../../types/airflow";
import clsx from "clsx";
import { humanReadableDate } from "../../../utils/helpers"
import s from "../DagRunsList.module.css";

type TRowProps = {
    dagRun: TDagRun;
    dagId: string;
};

function Row({ dagRun }: TRowProps) {
    return (
        <>
            <div className={s.dagrunsCell}>
                <Link to={`./${dagRun.dag_run_id}`}>
                    {dagRun.dag_run_id}
                </Link>
            </div>
            <div className={s.dagrunsCell}>{humanReadableDate(dagRun.start_date)}</div>
            <div
                className={clsx(s.dagrunsCell, s.status, {
                    [s.statusSuccess]: dagRun.state === "success",
                    [s.statusFailed]: dagRun.state === "failed",
                    [s.statusRunning]: dagRun.state === "running",
                })}
            >
                {dagRun.state}
            </div>
        </>
    );
}

export default Row;
