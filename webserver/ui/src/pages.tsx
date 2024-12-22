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

import NerMailboxDashboard from "./components/dashboards/NerMailbox/NerMailboxDashboard";
import NerTransformDashboard from "./components/dashboards/NerTransform/NerTransformDashboard";
import NerProcessDashboard from "./components/dashboards/NerProcess/NerProcessDashboard";
import ImageTransformDatasetDashboard from "./components/dashboards/ImageTransformDataset/ImageTransformDatasetDashboard";
import ImageProcessingDashboard from "./components/dashboards/ImageProcess/ImageProcessDashboard";
import ImageMailboxDashboard from "./components/dashboards/ImageMailbox/ImageMailboxDashboard";

const dashboards: RouteObject[] = [
    /* DASHBOARDS */
    {
        path: "ner/dashboard/mailbox",
        element: <NerMailboxDashboard />,
    },
    {
        path: "ner/dashboard/ner_transform_dataset",
        element: <NerTransformDashboard />,
    },
    {
        path: "ner/dashboard/ner_process",
        element: <NerProcessDashboard />,
    },
    {
        path: "images/dashboard/mailbox",
        element: <ImageMailboxDashboard />,
    },
    {
        path: "images/dashboard/image_transform_dataset",
        element: <ImageTransformDatasetDashboard />,
    },
    {
        path: "images/dashboard/image_process",
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
