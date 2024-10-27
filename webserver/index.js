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

const elasticClient = require("./utils/elastic");
const airflowUtil = require("./utils/airflow");

const PORT = process.env.PORT || 3000;

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

app.get("/api/dags", async (req, res) => {
    await fetch(`${process.env.AIRFLOW_SERVER}/api/v1/dags`, {
        headers: airflowUtil.getAirflowHeaders(),
    })
        .then((resp) => resp.json())
        .then((data) => {
            res.json(data);
        })
        .catch((_err) => {
            res.status(500).json({ status: 500 });
        });
});

app.get("/api/dagruns/:dagid", async (req, res) => {
    fetch(
        `${process.env.AIRFLOW_SERVER}/api/v1/dags/${req.params["dagid"]}/dagRuns`,
        {
            headers: airflowUtil.getAirflowHeaders(),
        }
    )
        .then((data) => data.json())
        .then((data) => {
            res.json(data);
        })
        .catch((_err) => {
            res.status(500).json({
                status: 500,
            });
        });
});

app.post("/api/dagruns/:dagid", async (req, res) => {
    const dags = await fetch(
        `${process.env.AIRFLOW_SERVER}/api/v1/dags/${req.params["dagid"]}/dagRuns`,
        {
            headers: airflowUtil.getAirflowHeaders(),
        }
    ).then((res) => res.json());

    res.json(dags);
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
    } catch {
        res.status(500).json({ status: 500 });
    }
});

app.get("/*", (req, res) => {
    //if address doesn't start with /api/*, send the index.html file and let react-router handle it
    res.sendFile(path.join(__dirname, "/ui/dist", "index.html"));
});

app.listen(3000, () => {
    console.log("Server started");
});
