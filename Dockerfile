# syntax=docker/dockerfile:1
FROM apache/airflow:2.9.0
WORKDIR /usr/src/app
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY . .