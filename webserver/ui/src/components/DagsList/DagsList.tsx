import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import { TDag } from "../../types/airflow";
import BackButton from "../BackButton/BackButton";

function DagsList() {
    let [isLoading, setIsLoading] = useState<boolean>(true);
    let [dags, setDags] = useState<TDag[]>([]);
    let [errorMessage, setErrorMessage] = useState("");

    let getDags = async () => {
        try {
            const response = await fetch("/api/dags");

            const statusCode = response.status;
            if (!statusCode.toString().startsWith("2")) {
                throw new Error(
                    `There was an error when handling request. Status code: ${statusCode}`
                );
            }

            const json = await response.json();

            setDags(json.dags);
        } catch (error) {
            if (error instanceof Error) setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
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
            <BackButton />
            <h1> DAGs </h1>
            {isLoading ? (
                "Loading..."
            ) : errorMessage ? (
                errorMessage
            ) : dags.length ? (
                <List>
                    {dags.map((dag) => {
                        return (
                            <ListItem key={`link-${dag.dag_id}`} disablePadding>
                                <Link to={`/dags/${dag.dag_id}`}>
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
                                </Link>
                            </ListItem>
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
