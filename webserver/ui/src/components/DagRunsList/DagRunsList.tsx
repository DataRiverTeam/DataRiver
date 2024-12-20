import { Link } from "react-router-dom";
import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import TablePagination from "@mui/material/TablePagination";
import { TDagRun } from "../../types/airflow";

import s from "./DagRunsList.module.css";

import clsx from "clsx";

type TDagRunsListProps = {
    dagRuns: TDagRun[];
};

function DagRunsList({ dagRuns }: TDagRunsListProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedDagRuns = dagRuns.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );
    return (
        <TableContainer component={Paper}>
            <TablePagination
                rowsPerPageOptions={[5, 10, 50]}
                component="div"
                count={dagRuns.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
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
                    {paginatedDagRuns.map((dagRun) => (
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
                                    to={`/dags/${
                                        dagRun.dag_id
                                    }/${encodeURIComponent(dagRun.dag_run_id)}`}
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
                                    to={`/ner/search?&map-file-run-id=${encodeURIComponent(
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
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={dagRuns.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </TableContainer>
    );
}

export default DagRunsList;
