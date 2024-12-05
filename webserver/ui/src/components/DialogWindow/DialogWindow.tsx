import { ReactNode } from "react";
// import s from "./DialogWindow.module.css";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

type DialogWindowProps = {
    children: ReactNode;
    handleClose: () => any;
    open: boolean;
    title: string;
};

function DialogWindow({
    title,
    children,
    handleClose,
    open,
}: DialogWindowProps) {
    return (
        // <div className={s.overlay}>
        //     <Card>
        //         <CardContent>{children}</CardContent>
        //     </Card>
        // </div>
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>{title}</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={(theme) => ({
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: theme.palette.grey[500],
                })}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent>{children}</DialogContent>
        </Dialog>
    );
}

export default DialogWindow;
