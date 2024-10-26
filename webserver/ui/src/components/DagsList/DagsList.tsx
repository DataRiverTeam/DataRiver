import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import { TDag } from "../../types/airflow";

function DagsList() {
    let [dags, setDags] = useState<TDag[]>([]);
    let [errorMessage, setErrorMessage] = useState("");

    let getDags = () => {
        fetch("/api/dags")
            .then((res) => res.json())
            .then((json) => {
                setDags(json.dags);
            })
            .catch((err) => {
                setErrorMessage(err);
            });
    };

    useEffect(() => {
        getDags();
        // const fetchDagInterval = setInterval(() => {
        //     getDags();
        // }, 10000);

        return () => {
            // clearInterval(fetchDagInterval);
        };
    }, []);

    return (
        <>
            <h1> DAGs </h1>
            {errorMessage ? (
                errorMessage
            ) : dags.length ? (
                <List>
                    {dags.map((dag) => {
                        return (
                            <Link to={`/dags/${dag.dag_id}`}>
                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemText
                                            primary={dag.dag_display_name}
                                            // secondary={
                                            //     dag.is_active
                                            //         ? "active"
                                            //         : "inactive"
                                            // }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </Link>
                        );
                    })}
                </List>
            ) : (
                "No DAGs to display."
            )}
        </>
    );
}

export default DagsList;
