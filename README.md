# How to run container
If you've built any previous version run:
```
docker compose build
```

In order to start server simply run. First run will take few minutes image have to be built.
```
docker compose up
```

To run also elastic-search cluster run
```
docker compose --profile elastic up
```

To run also elastic-search cluster and kibana dashboard run
```
docker compose --profile elastic --profile debug up
```

To remove container run.
```
docker compose down
```

If you want to delete all pulled images and volumes created run.
```
docker compose down --volumes --rmi all
```

# Services
## Airflow webserver: 
- port: http://127.0.0.1/ 
- username: airflow 
- password: airflow 
## Kibana:
- port: http://localhost:5601/ 
## Elasticsearch:
- port: http://localhost:9200/

# If smth won't work it is worth to try
```
sudo usermod -aG docker <your-user-name>
```
