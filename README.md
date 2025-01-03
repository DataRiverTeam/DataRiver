# DataRiver

## Quick start
### Requirements
In order to run the containers, you need [Docker](https://www.docker.com).


### Building Docker containers

Run Airflow, Elasticsearch and UI (**Recommended way**) 
```
docker compose --profile ui up
```

#### Alternatively

Run Airflow with Elasticsearch cluster and Kibana dashboard
```
docker compose --profile debug up
```

Rebuild base image (_required after modifying the requirements.txt or package.json_)
```
docker compose --profile ui up -V --build
```
## Running ner workflow from UI
### Step 1
Open http://localhost:3000/ in the browser.
### Step 2
Click "Import dataset" tile in "Named Entity Recognition" section
### Step 3
If there is no active sensor click "Activate file sensor" button
### Step 4
Browse and upload example file ```./test_data/texts/texts_small.json```
### Step 5
After uploading file click "Track processing"
### Step 6
Wait few seconds and while dag run appear you can click button in "Results" column in order to navigate to processing results

## Running image workflow from UI

### Step 1
Open http://localhost:3000/ in the browser.
### Step 2
Click "Import dataset" tile in "Image processing" section
### Step 3
If there is no active sensor click "Activate file sensor" button
### Step 4
Browse and upload example file ```./test_data/images/images_urls_small.json```
### Step 5
After uploading file click "Track processing"
### Step 6
Wait few seconds and while dag run appear you can click button in "Results" column in order to navigate to gallery with processing results

## Service access
### Web UI
- default URL: http://localhost:3000/

### Airflow webserver:

- default URL: http://localhost:8080/
- username: _airflow_
- password: _airflow_


### Kibana:

- default URL: http://localhost:5601/
- username: elastic
- password: airflow

### Elasticsearch:

- default URL: http://es01:9200/

### Formatter 
You can format code with
```
docker compose up format
```

## Troubleshooting

If something doesn't work it is worth to try adding current system user to docker group
```
sudo usermod -aG docker <your-user-name>
```

## Cleaning up
Remove container
```
docker compose down
```

Delete all related volumes.
```
docker compose down --volumes --remove-orphans
```

Delete all related images and volumes
```
docker compose down --volumes --rmi all
```

## Docs

You can find the operators' description [here](docs.md)
