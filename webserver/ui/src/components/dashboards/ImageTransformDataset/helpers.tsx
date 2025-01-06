import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { humanReadableDate } from "../../../utils/helpers"
import s from "../dashboards.module.css";
import { TDagRunWithParent } from "../../../utils/dags";
import clsx from "clsx";
import { getStatusStyleClass } from "../../../utils/dashboard";
import { Tooltip } from "@mui/material";

export function getDashboardListCells(
    dagRun: TDagRunWithParent
): React.ReactElement[] {
    return [
        <>{dagRun.dag_run_id}</>,
        <>{humanReadableDate(dagRun.start_date)}</>,
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
            { dagRun.state == "success" ? (  
                <Link
                    to={`/images/search?&image-transform-dataset-run-id=${encodeURIComponent(
                        dagRun.dag_run_id
                    )}`}
                >
                    <IconButton aria-label="DAG run results">
                        <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                </Link>
            ) : (        
                    <Tooltip title="Only dags with state 'success' has results">
                        <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
                    </Tooltip>          
                )}
        </div>,
        <div className={s.cellAlignCenter}>
            <Link
                to={`/images/dashboard/image_process?parentDagRunId=${encodeURIComponent(
                    dagRun.dag_run_id
                )}&isRedirect=true`}
            >
                <IconButton aria-label="Worker processes">
                    <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
                </IconButton>
            </Link>
        </div>
    ];
}
