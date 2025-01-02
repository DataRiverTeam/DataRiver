import { useState } from "react";
import MuiTable from "@mui/material/Table";
import MuiTableBody from "@mui/material/TableBody";
import MuiTableCell from "@mui/material/TableCell";
import MuiTableContainer from "@mui/material/TableContainer";
import MuiTableHead from "@mui/material/TableHead";
import MuiTableRow from "@mui/material/TableRow";
import MuiTablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import { Tooltip } from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// import s from "./Table.module.css";
// import clsx from "clsx";

type TTableProps = {
    header: React.ReactNode[];
    tooltips?: React.ReactNode[];
    rows: React.ReactNode[][];
};

function Table({ header, rows, tooltips }: TTableProps) {
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

    const paginatedRows = rows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );
    return (
        <MuiTableContainer component={Paper}>
            <MuiTablePagination
                rowsPerPageOptions={[5, 10, 50]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <MuiTable sx={{ minWidth: 650 }} aria-label="DAG runs list">
                <MuiTableHead>
                    <MuiTableRow>
                        {header.map((cell, index) => {
                            return (
                                <MuiTableCell key={`header-${index}`}>
                                    {tooltips ? (
                                        <Tooltip title={tooltips[index]} arrow>
                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                            <span style={{ marginRight: '3px' }}>{cell}</span>
                                            <HelpOutlineIcon fontSize="inherit"></HelpOutlineIcon>
                                        </span>
                                        </Tooltip>
                                    ) : (<span>{cell}</span>)}
    
                                </MuiTableCell>
                            );
                        })}
                    </MuiTableRow>
                </MuiTableHead>
                <MuiTableBody>
                    {paginatedRows.map((row, rowIndex) => (
                        <MuiTableRow key={`row-${rowIndex}`}>
                            {row.map((cell, cellIndex) => (
                                <MuiTableCell
                                    key={`row-${rowIndex}-cell-${cellIndex}`}
                                >
                                    {cell}
                                </MuiTableCell>
                            ))}
                        </MuiTableRow>
                    ))}
                </MuiTableBody>
            </MuiTable>
            <MuiTablePagination
                rowsPerPageOptions={[5, 10, 50]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </MuiTableContainer>
    );
}

export default Table;
