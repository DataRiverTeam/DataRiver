require("dotenv").config();

const path = require("path");

const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(express.json());

app.use(express.static("ui/dist"));

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploaded";
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let basePath = UPLOAD_DIR;
        let providedDir = req.body.directory;
        if (providedDir && typeof providedDir === "string") {
            basePath = path.join(basePath, providedDir);
            console.log("BASEPATH:", basePath);
        }

        return cb(null, basePath);
    },
    filename: function (req, file, cb) {
        const fragments = file.originalname.split(".");

        const extension =
            !file.originalname.startsWith(".") && fragments.length > 1
                ? fragments.pop()
                : "";

        cb(null, `${fragments.join(".")}-${Date.now()}.${extension}`);
    },
});

const upload = multer({ storage: storage });

const { getElasticClient } = require("./utils/elastic");
const ELASTIC_HOST = process.env.ELASTIC_HOST || "https://localhost:9200";
const elasticClient = getElasticClient(ELASTIC_HOST);

const AIRFLOW_HOST = process.env.AIRFLOW_HOST || "http://localhost:8080";
const airflowUtil = require("./utils/airflow");
const PORT = process.env.UI_PORT || 3000;

const fsUtils = require("./utils/filesystem");

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
    try {
        const dagId = req.params["dagid"];
        const options = {
            headers: airflowUtil.getAirflowHeaders(),
        };

        const dagRuns = await fetch(
            `${AIRFLOW_HOST}/api/v1/dags/${dagId}/dagRuns`,
            options
        ).then((data) => data.json());

        res.json({
            status: 200,
            ...dagRuns,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500 });
    }
});

app.post("/api/dags/:dagid/dagruns", async (req, res) => {
    const dagId = req.params["dagid"];

    console.log(`Received request:
        ${JSON.stringify(req.body, null, 1)}`);
    try {
        const response = await fetch(
            `${AIRFLOW_HOST}/api/v1/dags/${dagId}/dagRuns`,
            {
                method: "POST",
                body: JSON.stringify(req.body),
                headers: {
                    ...airflowUtil.getAirflowHeaders(),
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            }
        );

        // FIXME: if user-provided parameters have wrong type
        // (e.g. user providers "10" instead of 10)
        // Airflow server returns HTML page instead of valid JSON
        // what obviously fails
        const data = await response.json();

        res.status(response.status).send({
            ...data,
            status: response.status,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: 500,
        });
    }
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
    const SIZE = 20;

    // query params
    const start = req.query["start"] || 0;

    const textFragment = req.query["text"] || null;
    const dagRunId = req.query["dag-run-id"] || null;
    const lang = req.query["lang"] || null;
    const ners = req.query["ners"]
        ? req.query["ners"].split(",").map((item) => item.trim())
        : [];

    const mustClauses = [];
    if (textFragment) {
        mustClauses.push({ match: { content: textFragment } });
    }

    // NOTE:
    // We give up on searching by dag_rund_id's substring.
    // It is possible, to search it using wildcard query,
    // but it can result in performance issues
    //
    // Looking for exact match might be enough
    if (dagRunId) {
        mustClauses.push({ match: { "dag_run_id.keyword": dagRunId } });
    }

    if (lang) {
        mustClauses.push({ term: { "language.keyword": lang } });
    }

    ners.forEach((ner) => {
        mustClauses.push({
            match: { "ner.ents.text": ner },
        });
    });

    const query = {
        bool: {
            must: mustClauses,
        },
    };

    console.log("Sending query:");
    console.log(JSON.stringify(query, null, 2));

    try {
        const result = await elasticClient.search({
            index: "ner",
            size: 10,
            from: start,
            query: query,
        });

        res.json({ status: 200, ...result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500 });
    }
});

app.get("/api/files", async (req, res) => {
    const files = await fsUtils.getFiles(UPLOAD_DIR);

    res.json(
        files.map((item) => ({
            ...item,
            parentPath: item.parentPath.replace(
                new RegExp(`${UPLOAD_DIR}\/?`),
                "/"
            ),
        }))
    );
});

app.get("/api/*", async (req, res) => {
    res.status(403).send();
});

/* 
    FILE UPLOAD
*/

app.post("/files", upload.array("files", 10), (req, res, _next) => {
    try {
        res.json({
            status: 200,
            files: req.files.map((file) => file.filename),
        });
    } catch (error) {
        res.status(500).json({ status: 500 });
    }
});

app.get("/*", (req, res) => {
    //if address doesn't start with /api/*, send the index.html file and let react-router handle it
    res.sendFile(path.join(__dirname, "/ui/dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
