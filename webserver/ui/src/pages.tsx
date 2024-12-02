import { RouteObject } from "react-router-dom";
import App from "./App";
import NerBrowser from "./components/NerBrowser/NerBrowser";
import DagsList from "./components/DagsList/DagsList";
import DagDetails from "./components/DagDetails/DagDetails";
import DagRunDetails from "./components/DagRunDetails/DagRunDetails";
import DagTrigger from "./components/DagTrigger/DagTrigger";
import FileExplorer from "./components/FileExplorer/FileExplorer";
import ImageBrowser from "./components/ImageBrowser/ImageBrowser";
import ImageDetails from "./components/ImageDetails/ImageDetails";
import NerDashboard from "./components/NerDashboard/NerDashboard";
import Home from "./components/Home/Home";

const pages: RouteObject[] = [
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: "ner/dashboard/mailbox",
                element: <NerBrowser />,
            },
            {
                path: "ner/dashboard",
                element: <NerDashboard />,
            },
            {
                path: "dags",
                element: <DagsList />,
            },
            { path: "dags/:dagId", element: <DagDetails /> },
            {
                path: "dags/:dagId/:runId",
                element: <DagRunDetails />,
            },
            {
                path: "dags/:dagId/trigger",
                element: <DagTrigger />,
            },
            {
                path: "fileexplorer",
                element: <FileExplorer />,
            },
            {
                path: "images/search",
                element: <ImageBrowser />,
            },
            {
                path: "images/:imageId",
                element: <ImageDetails />,
            },
        ],
    },
];

export default pages;
