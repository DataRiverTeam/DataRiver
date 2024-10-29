require("dotenv").config();

const { Client } = require("@elastic/elasticsearch");

function getElasticClient(node_url) {
    console.log("Connecting to Elasticsearch node: ", node_url);

    return new Client({
        node: node_url,
        auth: {
            username: process.env.ELASTIC_LOGIN,
            password: process.env.ELASTIC_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
}

module.exports = {
    getElasticClient: getElasticClient,
};
