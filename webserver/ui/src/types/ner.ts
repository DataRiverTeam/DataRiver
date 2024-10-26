export type TNerStat = {
    value: string;
    count: number;
};

export type TNerDoc = {
    content: string;
    title: string;
    translated?: string;
    language: string;
    ner: {
        text: string;
        ents: { start: number; end: number; label: string[] };
        sents: { start: number; end: number }[];
        tokens: {
            id: number;
            start: number;
            end: number;
            tag: string;
            pos: string;
            morph: string;
            lemma: string;
            dep: string;
            head: 0;
        }[];
    }[];
    ner_stats: {
        title: string;
        stats: {
            labels: TNerStat[];
            entities: TNerStat[];
        };
    };
};
