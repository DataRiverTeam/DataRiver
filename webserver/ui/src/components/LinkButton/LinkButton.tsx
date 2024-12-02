import { Link, RelativeRoutingType } from "react-router-dom";
import Button from "@mui/material/Button";

import s from "./LinkButton.module.css";
import { ReactNode } from "react";

type TLinkButtonProps = {
    to: string;
    relative?: RelativeRoutingType;
    children?: string | ReactNode;
    type?: "button" | "submit";
    startIcon?: ReactNode;
};

function LinkButton({
    to,
    relative,
    children,
    type = "button",
    startIcon = null,
}: TLinkButtonProps) {
    return (
        <Link to={to} relative={relative || undefined}>
            <Button
                variant="outlined"
                className={s.blockButton}
                type={type}
                startIcon={startIcon}
            >
                {children}
            </Button>
        </Link>
    );
}

export default LinkButton;
