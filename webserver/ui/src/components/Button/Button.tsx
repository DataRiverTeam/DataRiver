import MuiButton from "@mui/material/Button";

import s from "./Button.module.css";
import { ReactNode } from "react";

type TButtonProps = {
    children?: string | ReactNode;
    type?: "button" | "submit";
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
    disabled?: boolean | undefined;
    className?: string | undefined;
};

function Button({
    children,
    type = "button",
    startIcon = null,
    endIcon = null,
    onClick = undefined,
    disabled = false,
    className = undefined,
}: TButtonProps) {
    return (
        <MuiButton
            variant="outlined"
            className={className || s.blockButton}
            type={type}
            startIcon={startIcon}
            endIcon={endIcon}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </MuiButton>
    );
}

export default Button;
