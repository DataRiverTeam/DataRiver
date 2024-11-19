import { Link, RelativeRoutingType } from "react-router-dom";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import s from "./BackButton.module.css";

type TBackButtonProps = {
    to: string;
    relative?: RelativeRoutingType;
};

function BackButton({ to, relative }: TBackButtonProps) {
    return (
        <Link to={to} relative={relative || undefined}>
            <Button
                variant="outlined"
                className={s.backButton}
                type="submit"
                startIcon={<ArrowBackIcon />}
            >
                Back
            </Button>
        </Link>
    );
}

export default BackButton;
