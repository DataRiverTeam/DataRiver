# How to run container
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

If you want to delete all volumes created run.
```
docker compose down --volumes --remove-orphans
```
If you want to delete all pulled images and volumes created run.
```
docker compose down --volumes --rmi all
```

## Airflow webserver
=======
If you want to rebuild base image (needed after adding package to requirements.txt):
``` 
docker compose build
```

# Services
## Airflow webserver: 
- port: http://localhost/8080
- username: airflow 
- password: airflow 

> ### **_NOTE:_**  After first webserver start you need to provide fs_conn_id in UI. 
> In order to do that perform following actions 
> #### Step 1: 
> select admin page in navbar the\
![insturction pt.2](resources/fs_conn_id_1.png?raw=true) 
> #### Step 2: 
> Select fs_conn_id and insert path `/opt/airflow/data` \
![insturction pt.1](resources/conn_id.png) 

## Kibana:
- port: http://localhost:5601/ 
- username: elastic 
- password: airflow 
## Elasticsearch:
- port: http://es01:9200/

## If smth won't work it is worth to try
```
sudo usermod -aG docker <your-user-name>
```

# Operators

## `datariver.operators.collectstats`

### `SummaryStatsOperator`

Generates a summary text file based on passed dictionary.

Parameters:
- `ner_counters: dict` - contains two dictionaries, the first dictionary contains number of occurrences for each label and the second contains number of occurrences for each named entity
- `translate_stats: dict` - contains a dictionary with statistics generated during translation, namely: a dictionary with number of occurrences for each language and counts of: successfully translated files, translations with errors and files for which translation was not necessary
- `fs_conn_id: str` - an ID of Airflow filesystem connection; used to get the base path of file's output location
- `output_dir: str = "."` - a subdirectory to put the output file, relative to the base path specified by filesystem connection  
- `summary_filename: str` - a name of output file

### `SummaryMarkdownOperator`

Generates a summary Markdown file based on passed dictionary.

Parameters:
- `fs_conn_id: str` - an ID of Airflow filesystem connection; used to get the base path of file's output location
- `output_dir: str = "."` - a subdirectory to put the output file, relative to the base path specified by filesystem connection  
- `summary_filename: str` - a name of output file

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
Expects a file containing JSON array. 
It iterates over the list and executes a map function over every element.

Parameters:
- `fs_conn_id: str` - an ID of Airflow filesystem connection; used to get the base path of input file's location
- `path: str` - path relative to the base path specified by given file system connection
- `python_callable: Callable[Any, Any]` - any Python function expecting an item from the JSON list as an argument; might return any value which will be then returned to the XCOM by the operator.


## `datariver.operators.langdetect`

### `LangdetectOperator`
Generates a dictionary which for each lang code contains list of paths to files in that language

Parameters:
- `fs_conn_id: str` - an ID of Airflow filesystem connection; used to get the base path of file's output location
- `files: list` - each element of that list is a string containing path to an input file

## `datariver.operators.ner`

### `NerOperator`
Searches for named entities and outputs JSON-like data, which contain e. g. sentences containing named entities with position ant type of the entity

Parameters:
- `fs_conn_id: str` - an ID of Airflow filesystem connection; used to get the base path of file's output location
- `path: str` - path at which task looks for file to translate
- `model: str = "en_core_web_md"` - model used during named entities recognition
- `language: str = "english"` - language of input file

## `datariver.operators.stats`

### `NerStatisticsOperator`
Generates dictionary with NER statistics using JSON-like data

Parameters:
- `json_data: str` - data in JSON-like format generated by to_json() of spacy, containing information about named entities

## `datariver.operators.translate`

### `DeepTranslatorOperator`
Detects language, translates file fragment by fragment to target language and shares statistics about translated files.

Parameters:
- `fs_conn_id: str` - an ID of Airflow filesystem connection; used to get the base path of file's output location
- `output_dir: str = "."` - a subdirectory to put the output file, relative to the base path specified by filesystem connection 
- `output_language: str` - two-letter language code, output file will be translated to language corresponding to this code
- `files: list` - each element of that list is a string containing path to an input file