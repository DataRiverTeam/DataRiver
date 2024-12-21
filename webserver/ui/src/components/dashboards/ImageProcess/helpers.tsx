import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import s from "../dashboards.module.css";
import { TDagRunWithParent } from "../../../utils/dags";
import clsx from "clsx";

export function getDashboardListCells(
    dagRun: TDagRunWithParent
): React.ReactElement[] {
    let statusClass = null;

    switch (dagRun.state) {
        case "success":
            statusClass = s.cellStatusSuccess;
            break;
        case "running":
            statusClass = s.cellStatusRunning;
            break;
        case "failed":
            statusClass = s.cellStatusFailed;
            break;
        case "queued":
            statusClass = s.cellStatusQueued;
            break;
    }

    return [
        <>{dagRun.dag_run_id}</>,
        <>{dagRun.start_date}</>,
        <span className={clsx(s.cellStatus, statusClass)}>{dagRun.state}</span>,
        <div className={s.cellAlignCenter}>
            <Link
                to={`/dags/${dagRun.dag_id}/${encodeURIComponent(
                    dagRun.dag_run_id
                )}`}
            >
                <IconButton aria-label="DAG run details">
                    <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
                </IconButton>
            </Link>
        </div>,
        <div className={s.cellAlignCenter}>
            <Link
                to={`/images/search?&image-process-run-id=${encodeURIComponent(
                    dagRun.dag_run_id
                )}`}
            >
                <IconButton aria-label="DAG run ">
                    <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
                </IconButton>
            </Link>
        </div>,
    ];
}
