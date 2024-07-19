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

# Ariflow webserver

username: airflow \
password: airflow

# If smth won't work it is worth to try
```
sudo usermod -aG docker <your-user-name>
```



# Operators

## `datariver.operators.collectstats`

### `SummaryStatsOperator`

### `SummaryMarkdownOperator`


## `datariver.operators.elasticsearch`

A wrapper for the [Elastisearch python module](https://elasticsearch-py.readthedocs.io/en/v8.14.0/api/elasticsearch.html#elasticsearch.Elasticsearch.search).

### `ElasticPushOperator`
Pushes a valid document to the specified Elasticsearch index.

Parameters:
- `index: str` - the name of the Elasticsearch index
- `document: dict` - a document to be put into the specified index
- `es_conn_args: dict` - a dictionary containing valid `elasticsearch.Elasticsearch` parameters as key-value pairs.
    - See [Elasticsearch module documentation](https://elasticsearch-py.readthedocs.io/en/v8.14.0/api/elasticsearch.html#elasticsearch) 


### `ElasticSearchOperator`
Performs a search query in the specified Elasticsearch index.

Parameters:
- `index: str` - the name of the Elasticsearch index
- `query: dict` - a dictionary defining a valid Elasticsearch query
- `es_conn_args: dict` - a dictionary containing valid `elasticsearch.Elasticsearch` parameters as key-value pairs.
    - See [Elasticsearch module documentation](https://elasticsearch-py.readthedocs.io/en/v8.14.0/api/elasticsearch.html#elasticsearch) 
    

## `datariver.operators.json`

### `MapJsonFile`

## `datariver.operators.langdetect`

### `LangdetectOperator`

## `datariver.operators.ner`

### `NerOperator`

## `datariver.operators.stats`

### `NerStatisticsOperator`

## `datariver.operators.translate`

### `DeepTranslatorOperator`
