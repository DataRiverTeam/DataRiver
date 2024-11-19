export type TDagParamsFormFields = {
    [key: string]: number | string;
};

export const triggerDag = async (
    data: TDagParamsFormFields,
    dagId: string,
    // navigate: NavigateFunction | null
    onSuccess: (() => any) | null
) => {
    try {
        let response = await fetch(`/api/dags/${dagId}/dagRuns`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                conf: data,
            }),
        });

        if (response.status.toString() !== "200") {
            throw new Error(
                `Couldn't trigger a new DAG run. Status code ${response.status}`
            );
        }

        if (onSuccess) {
            onSuccess();
        }
    } catch (error) {
        if (error instanceof Error) {
            alert(error.message);
        }
    }
};
