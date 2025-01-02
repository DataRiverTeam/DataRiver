import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import s from "../dashboards.module.css";
import { TDagRunWithParent } from "../../../utils/dags";
import clsx from "clsx";
import { getStatusStyleClass } from "../../../utils/dashboard";

export function getDashboardListCells(
    dagRun: TDagRunWithParent
): React.ReactElement[] {
    return [
        <>{dagRun.dag_run_id}</>,
        <>{dagRun.start_date}</>,
        <span className={clsx(s.cellStatus, getStatusStyleClass(dagRun))}>
            {dagRun.state}
        </span>,
        <div className={s.cellAlignCenter}>
            <Link
                to={`./${encodeURIComponent(
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
                to={`/ner/search?&ner-single-file-run-id=${encodeURIComponent(
                    dagRun.dag_run_id
                )}`}
            >
                <IconButton aria-label="DAG run results">
                    <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
                </IconButton>
            </Link>
        </div>,
    ];
}
