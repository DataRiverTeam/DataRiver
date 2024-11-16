export type TNerStat = {
    value: string;
    count: number;
};



export type TBaseNerDocProps = {
    id: string;
    content: string;
    title: string;
    dag_run_id: string;
};

export type TNerDocResult = {
    translated: string;
    language: string;
    ner: {
        sentence: string;
        ents: { text: string; label: string }[];
    }[];
    ner_stats: {
        title: string;
        stats: {
            labels: TNerStat[];
            entities: TNerStat[];
        };
    };
    dag_start_date: string;
    dag_processed_date: string;
}

export type TParsedNerDocProps = TBaseNerDocProps & TNerDocResult;

export type TFailedNerDocProps = TBaseNerDocProps & Partial<TNerDocResult> & {
    error: {
        "task_id": string;
        "message": string;
    }
}

export type TNerDoc = TFailedNerDocProps | TParsedNerDocProps;