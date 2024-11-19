import {
    TDagRunsCollection,
    TDagRun,
    TTaskInstance,
    TDag,
} from "../types/airflow";

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

    async getDags() {
        const response = await fetch("/api/dags");

        if (!response.status.toString().startsWith("2")) {
            throw new Error(
                `There was an error when handling request. Status code: ${response.status}`
            );
        }

        const json: TDagsResponse = await response.json();

        return json;
    }

    async getDagRuns(dagId: string) {
        const response = await fetch(`/api/dags/${dagId}/dagruns`);

        if (!response?.status.toString().startsWith("2")) {
            throw new Error(
                `There was an error when handling request. Status code: ${response.status}`
            );
        }

        const json: TDagRunsCollectionResponse = await response.json();

        return json;
    }

    async getDagRunDetails(dagId: string, dagRunId: string) {
        const response = await fetch(`/api/dags/${dagId}/dagruns/${dagRunId}`);

        if (!response.status.toString().startsWith("2")) {
            throw new Error(
                `There was an error when handling request. Status code: ${response.status}`
            );
        }

        const json: TDagRunResponse = await response.json();

        return json;
    }

    async getDagRunTasks(dagId: string, dagRunId: string) {
        const response = await fetch(
            `/api/dags/${dagId}/dagruns/${dagRunId}/taskInstances`
        );

        if (!response.status.toString().startsWith("2")) {
            throw new Error(
                `There was an error when handling request. Status code: ${response.status}`
            );
        }

        const json: TTaskInstancesResponse = await response.json();

        return json;
    }
}
