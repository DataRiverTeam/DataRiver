import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import s from "./NavBar.module.css";

function NavBar() {
    return (
        <AppBar>
            <Toolbar disableGutters>
                <Button variant="text">
                    <Link to={"/dags"} className={s.link}>
                        DAGs
                    </Link>
                </Button>
                <Button variant="text">
                    <Link to={"/fileexplorer"} className={s.link}>
                        Files
                    </Link>
                </Button>
                <Button variant="text">
                    <Link to={"/ner"} className={s.link}>
                        Browse documents
                    </Link>
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default NavBar;
