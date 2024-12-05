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
import Home from "./components/Home/Home";

import MailboxDashboard from "./components/dashboards/Mailbox/MailboxDashboard";
import MapTextFilesDashboard from "./components/dashboards/MapTextFiles/MapTextFilesDashboard";
import NerFilesDashboard from "./components/dashboards/NerFiles/NerFilesDashboard";
import MapImageFilesDashboard from "./components/dashboards/MapImageFiles/MapImageFilesDashboard";
import ImageProcessingDashboard from "./components/dashboards/ImageProcessing/ImageProcessingDashboard";

const dashboards: RouteObject[] = [
    /* DASHBOARDS */
    {
        path: "ner/dashboard/mailbox",
        element: <MailboxDashboard />,
    },
    {
        path: "ner/dashboard/map_files",
        element: <MapTextFilesDashboard />,
    },
    {
        path: "ner/dashboard/ner_files",
        element: <NerFilesDashboard />,
    },
    {
        path: "images/dashboard/map_files",
        element: <MapImageFilesDashboard />,
    },
    {
        path: "images/dashboard/map_files",
        element: <ImageProcessingDashboard />,
    },
];

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
                path: "ner/search",
                element: <NerBrowser />,
            },
            ...dashboards,
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
