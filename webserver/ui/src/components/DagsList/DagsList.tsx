import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import { TDag } from "../../types/airflow";
import BackButton from "../BackButton/BackButton";
import { ApiClient } from "../../utils/api";

const client = new ApiClient();

function DagsList() {
    let [isLoading, setIsLoading] = useState<boolean>(true);
    let [dags, setDags] = useState<TDag[]>([]);
    let [errorMessage, setErrorMessage] = useState("");

    let getDags = async () => {
        try {
            const json = await client.getDags();

            setDags(json.dags);
        } catch (error) {
            if (error instanceof Error) setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getDags();
    }, []);

    return (
        <>
            <BackButton to="/" />
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
