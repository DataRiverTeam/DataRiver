import { RelativeRoutingType } from "react-router-dom";
import LinkButton from "../LinkButton/LinkButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type TBackButtonProps = {
    to: string;
    relative?: RelativeRoutingType;
};

function BackButton({ to, relative }: TBackButtonProps) {
    return (
        <>
            <LinkButton
                to={to}
                relative={relative || undefined}
                startIcon={<ArrowBackIcon />}
            >
                Back
            </LinkButton>
        </>
    );
}

export default BackButton;
