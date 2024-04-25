# How to run container
In order to start server simply run. First run will take few minutes image have to be built.
```
docker compose up
```

To stop container run.
```
docker compose down
```

If you want to delete all pulled images and volumes created run.
```
docker compose down --volumes --rmi all
```

# Ariflow webserver

username: airflow \
password: airflow

# If smth won't work it is worth to try
```
sudo usermod -aG docker <your-user-name>
```