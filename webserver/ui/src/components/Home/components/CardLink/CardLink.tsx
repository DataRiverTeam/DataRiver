import { Link } from "react-router-dom";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import s from "./CardLink.module.css";

function CardLink(props: {
    title: string;
    linkTo: string;
    description: string;
}) {
    const { linkTo, title, description } = props;

    return (
        <Link to={linkTo} className={s.link}>
            <Card className={s.card}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {title}
                    </Typography>
                    <Typography variant="body2">{description}</Typography>
                </CardContent>
                <CardActions>
                    <IconButton aria-label="add to favorites">
                        <ArrowForwardIosIcon />
                    </IconButton>
                </CardActions>
            </Card>
        </Link>
    );
}

export default CardLink;
