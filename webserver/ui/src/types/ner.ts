export type TNerStat = {
    value: string;
    count: number;
};

export type TNerDoc = {
    id: string;
    content: string;
    title: string;
    translated?: string;
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
    dag_run_id: string;
    dag_start_date?: string;
    dag_processed_date?: string;
};
