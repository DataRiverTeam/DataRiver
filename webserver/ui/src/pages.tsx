import { RouteObject } from "react-router-dom";
import App from "./App";
import NerBrowser from "./components/NerBrowser/NerBrowser";
import DagsList from "./components/DagsList/DagsList";
import DagDetails from "./components/DagDetails/DagDetails";

const pages: RouteObject[] = [
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "ner",
                element: <NerBrowser />,
            },
            { path: "dags/:dagId", element: <DagDetails /> },
            {
                path: "dags",
                element: <DagsList />,
            },
        ],
    },
];

export default pages;
