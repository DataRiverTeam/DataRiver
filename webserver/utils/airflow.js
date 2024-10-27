function getEncodedCredentials() {
  return Buffer.from(
    `${process.env.AIRFLOW_LOGIN}:${process.env.AIRFLOW_PASSWORD}`
  ).toString("base64");
}

function getAirflowHeaders() {
  return {
    Authorization: `Basic ${getEncodedCredentials()}`,
  };
}

module.exports = { getAirflowHeaders };
