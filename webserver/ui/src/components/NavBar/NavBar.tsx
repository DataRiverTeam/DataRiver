import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import s from "./NavBar.module.css";

function NavBar() {
    return (
        <AppBar className="navbar">
            <Toolbar disableGutters>
                <Button variant="text">
                    <Link to={"/"} className={s.link}>
                        Home
                    </Link>
                </Button>
                <Button variant="text">
                    <Link to={"/ner/search"} className={s.link}>
                        NER
                    </Link>
                </Button>
                <Button variant="text">
                    <Link to={"/images/search"} className={s.link}>
                        Images
                    </Link>
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default NavBar;
