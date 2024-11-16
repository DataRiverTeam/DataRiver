import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import s from "./BackButton.module.css";

function BackButton() {
    return (
        <Link to={".."} relative="path">
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
