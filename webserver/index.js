/*
    TODO:
    - fetch task status for a DAGrun
        -   use POST /dags/~/dagRuns/~/taskInstances/list to skip
            fetching dagRunIds and fetching tasks separately for each ID
    - handle file upload for DAGS
    - display DAGs in better way
*/

require("dotenv").config();

const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

const { getElasticClient } = require("./utils/elastic");
const ELASTIC_HOST = process.env.ELASTIC_HOST || "https://localhost:9200";
const elasticClient = getElasticClient(ELASTIC_HOST);

const AIRFLOW_HOST = process.env.AIRFLOW_HOST || "http://localhost:8080";
const airflowUtil = require("./utils/airflow");
const PORT = process.env.UI_PORT || 3000;

let schemas = {
    mailbox: {
        fs_conn_id: {
            type: "string",
            default: "fs_data",
        },
        filepath: {
            type: "string",
            default: "map/*.json",
        },
    },
};

app.use(express.static("ui/dist"));

// app.post("/upload", upload.array("files", 10), (req, res, _next) => {});

/*
 API ENDPOINTS
*/

app.get("/api/dags", async (req, res) => {
    fetch(`${AIRFLOW_HOST}/api/v1/dags`, {
        headers: airflowUtil.getAirflowHeaders(),
    })
        .then((resp) => resp.json())
        .then((data) => {
            res.json({ status: 200, ...data });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ status: 500 });
        });
});

app.get("/api/dags/:dagid/dagruns", async (req, res) => {
    fetch(`${AIRFLOW_HOST}/api/v1/dags/${req.params["dagid"]}/dagRuns`, {
        headers: airflowUtil.getAirflowHeaders(),
    })
        .then((data) => data.json())
        .then((data) => {
            res.json({ status: 200, ...data });
        })
        .catch((err) => {
            console.log(err);

            res.status(500).json({
                status: 500,
            });
        });
});

app.get("/api/dags/:dagid/dagruns/:runid", async (req, res) => {
    const dagId = req.params["dagid"];
    const runId = req.params["runid"];

    fetch(`${AIRFLOW_HOST}/api/v1/dags/${dagId}/dagRuns/${runId}`, {
        headers: airflowUtil.getAirflowHeaders(),
    })
        .then((data) => data.json())
        .then((data) => {
            res.json({ status: 200, ...data });
        })
        .catch((err) => {
            console.log(err);

            res.status(500).json({
                status: 500,
            });
        });
});

app.get("/api/dags/:dagid/dagRuns/:runid/taskInstances", async (req, res) => {
    const dagId = req.params["dagid"];
    const runId = req.params["runid"];

    try {
        const response = await fetch(
            `${AIRFLOW_HOST}/api/v1/dags/${dagId}/dagRuns/${runId}/taskInstances`,
            {
                headers: {
                    ...airflowUtil.getAirflowHeaders(),
                    Accept: "application/json",
                },
            }
        );

        // if (!response.status.toString().startsWith("2")) {
        //     throw new Error("Internal error");
        // }

        const json = await response.json();

        res.send({ status: 200, ...json });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500 });
    }
});

app.get("/api/ner/docs", async (req, res) => {
    //execute match for text search
    //execute term search for looking for exact value (like product_id)

    // EXAMPLE QUERY
    // GET /ner/_search/
    // {
    //   "query":{
    //     "match": { "document.text": "Kharkiv" } // normally, the key should be "text", not "document.text"
    //   }
    // }

    const textFragment = req.query.text;
    const id = req.query.id;
    if (!textFragment && !id) {
        res.status(400).send({ status: 400 });
        return;
    }
    try {
        const result = await elasticClient.search({
            index: "ner",
            query: {
                // match_phrase: { text: "..." },
                match: { content: textFragment },
            },
        });

        res.json({ status: 200, ...result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500 });
    }
});

app.get("/api/*", async (req, res) => {
    res.status(403).send();
});

app.get("/*", (req, res) => {
    //if address doesn't start with /api/*, send the index.html file and let react-router handle it
    res.sendFile(path.join(__dirname, "/ui/dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
