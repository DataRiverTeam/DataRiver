FROM apache/airflow:2.9.0
WORKDIR /usr/src/app
COPY requirements.txt requirements.txt
RUN python -m pip install -r requirements.txt
RUN python -c 'import nltk; nltk.download("punkt", download_dir="/home/airflow/.local/nltk_data")'
USER root
RUN apt-get update && apt-get install git-lfs -y
RUN git clone https://huggingface.co/Salesforce/blip-image-captioning-base /home/airflow/.local/BLIP
