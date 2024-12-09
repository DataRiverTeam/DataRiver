import {
    TDagRunsCollection,
    TDagRun,
    TTaskInstance,
    TDag,
    TDagDetails,
} from "../types/airflow";

import { TDagTriggerBody } from "./dags";

type TStatus = {
    status: number;
};

export type TDagsResponse = {
    dags: TDag[];
    total_entries: number;
} & TStatus;

export type TDagRunsCollectionResponse = TDagRunsCollection & TStatus;

export type TDagRunResponse = TDagRun & TStatus;

export type TTaskInstancesResponse = {
    task_instances: TTaskInstance[];
    status: number;
    total_entries: number;
};

export class ApiClient {
    //TODO: move repeated code to separate function/variables

    #handleResponse(response: Response) {
        if (!response?.status.toString().startsWith("2")) {
            throw new Error(
                `There was an error when handling request. Status code: ${response.status}`
            );
        }
    }

    async getDags() {
        const response = await fetch("/api/dags");
        this.#handleResponse(response);

        const json: TDagsResponse = await response.json();

        return json;
    }

    async getDagDetails(dagId: string) {
        const response = await fetch(`/api/dags/${dagId}/details`);
        this.#handleResponse(response);

        const json: TDagDetails = await response.json();

        return json;
    }

    async getDagRuns(dagId: string) {
        const response = await fetch(`/api/dags/${dagId}/dagruns`);
        this.#handleResponse(response);

        const json: TDagRunsCollectionResponse = await response.json();

        return json;
    }

    async getDagRunDetails(dagId: string, dagRunId: string) {
        const response = await fetch(`/api/dags/${dagId}/dagruns/${dagRunId}`);
        this.#handleResponse(response);

        const json: TDagRunResponse = await response.json();

        return json;
    }

    async getDagRunTasks(dagId: string, dagRunId: string) {
        const response = await fetch(
            `/api/dags/${dagId}/dagruns/${dagRunId}/taskInstances`
        );
        this.#handleResponse(response);

        const json: TTaskInstancesResponse = await response.json();

        return json;
    }

    async triggerDag(
        data: TDagTriggerBody,
        dagId: string,
        onSuccess: (() => any) | null
    ) {
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
    }
}
