import { Link, RelativeRoutingType } from "react-router-dom";
import Button from "../Button/Button";

import { ReactNode } from "react";

type TLinkButtonProps = {
    to: string;
    relative?: RelativeRoutingType;
    children?: string | ReactNode;
    type?: "button" | "submit";
    startIcon?: ReactNode;
    className?: string | undefined;
};

function LinkButton({
    to,
    relative,
    children,
    type = "button",
    startIcon = null,
    className = undefined,
}: TLinkButtonProps) {
    return (
        <Link to={to} relative={relative || undefined}>
            <Button type={type} startIcon={startIcon} className={className || undefined}>
                {children}
            </Button>
        </Link>
    );
}

export default LinkButton;
