import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TDagRun } from "../../../types/airflow";
import { ApiClient, TDagRunsCollectionResponse } from "../../../utils/api";
import BackButton from "../../BackButton/BackButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Tooltip from "@mui/material/Tooltip";
import RefreshIcon from "@mui/icons-material/Refresh";
import Button from "../../Button/Button";
import clsx from "clsx";
import s from "./ImageProcess.module.css";

const client = new ApiClient();

const dagId = "image_process";
function ImageProcessingDashboard() {
    let [dagRuns, setDagRuns] = useState<TDagRun[]>([]);
    let [areDagRunsLoading, setAreDagRunsLoading] = useState(true);

    let fetchDagRuns = async () => {
        try {
            const json: TDagRunsCollectionResponse = await client.getDagRuns(
                dagId
            );

            setDagRuns(json.dag_runs);
        } catch (error) {
            console.error(error);
        } finally {
            setAreDagRunsLoading(false);
        }
    };

    useEffect(() => {
        fetchDagRuns();
    }, []);

    return (
        <>
            <BackButton to="/" />
            <h1>Processing images</h1>
            <p>Monitor processing of the articles.</p>

            <h2>TODO: MAKE LINKS TO THE IMAGE BROWSER</h2>

            <h2> Active DAGs</h2>
            <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px'
            }}>
                <h2> Recent DAG runs</h2>
                <Tooltip title="Refresh DAG runs">
                    <span>
                        <Button 
                            onClick={fetchDagRuns} 
                            disabled={areDagRunsLoading}
                        >
                            <RefreshIcon />
                        </Button>
                    </span>
                </Tooltip>
            </div>  
            {areDagRunsLoading ? (
                "Loading DAG runs..."
            ) : (
                // <DagRunsList dagId={dagId} dagRuns={dagRuns} />
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>DAG run ID</TableCell>
                                <TableCell>Start date</TableCell>
                                <TableCell>State</TableCell>
                                <TableCell align="center">Tasks</TableCell>
                                <TableCell align="center">Results</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dagRuns.map((dagRun) => (
                                <TableRow
                                    key={dagRun.dag_run_id}
                                    sx={{
                                        "&:last-child td, &:last-child th": {
                                            border: 0,
                                        },
                                    }}
                                >
                                    <TableCell scope="row">
                                        {dagRun.dag_run_id}
                                    </TableCell>
                                    <TableCell scope="row">
                                        {dagRun.start_date}
                                    </TableCell>
                                    <TableCell
                                        scope="row"
                                        className={clsx(s.cellStatus, {
                                            [s.cellStatusSuccess]:
                                                dagRun.state === "success",
                                            [s.cellStatusFailed]:
                                                dagRun.state === "failed",
                                            [s.cellStatusRunning]:
                                                dagRun.state === "running",
                                        })}
                                    >
                                        {dagRun.state}
                                    </TableCell>
                                    <TableCell scope="row" align="center">
                                        <Link
                                            to={`/dags/${dagId}/${encodeURIComponent(
                                                dagRun.dag_run_id
                                            )}`}
                                        >
                                            <IconButton aria-label="DAG run details">
                                                <ArrowForwardIosIcon
                                                    sx={{ fontSize: 12 }}
                                                />
                                            </IconButton>
                                        </Link>
                                    </TableCell>
                                    <TableCell scope="row" align="center">
                                        <Link
                                            to={`/images/search?&image-process-run-id=${encodeURIComponent(
                                                dagRun.dag_run_id
                                            )}`}
                                        >
                                            <IconButton aria-label="DAG run ">
                                                <ArrowForwardIosIcon
                                                    sx={{ fontSize: 12 }}
                                                />
                                            </IconButton>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );
}

export default ImageProcessingDashboard;
