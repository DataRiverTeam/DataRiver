export const exampleNerJson = [
    {
        resultData: {
            results: [
                {
                    content:
                        "Lorem ipsum dolor sit, amet consectetur adipisicing elit.",
                    title: "Example article title",
                },
            ],
        },
    },
    {
        resultData: {
            results: [
                {
                    title: "Another example article title",
                    content: "Eveniet, illo?",
                },
            ],
        },
    },
];

export const triggerMailboxConf = {
    batch_size: 10,
    encoding: "utf-8",
    filepath: "map/*.json",
    fs_conn_id: "fs_data",
} as const;
