export const schemas = {
    mailbox: {
        fs_conn_id: {
            type: "string",
            default: "fs_data",
        },
        filepath: {
            type: "string",
            default: "map/*.json",
        },
        batch_size: {
            type: "integer",
            default: 10,
        },
        encoding: {
            type: "string",
            default: "utf-8",
        },
    },
};
