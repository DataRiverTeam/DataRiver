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
};
