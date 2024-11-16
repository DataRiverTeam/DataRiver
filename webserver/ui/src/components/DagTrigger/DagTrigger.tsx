import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import { useForm, SubmitHandler, UseFormRegister } from "react-hook-form";
import clsx from "clsx";

import Button from "@mui/material/Button";

import s from "./DagTrigger.module.css";

import { TDagDetail, TDagParam } from "../../types/airflow";
import BackButton from "../BackButton/BackButton";

type TDagNamedParam = TDagParam & {
    name: string;
};

type TDagParamsFormFields = {
    [key: string]: number | string;
};

type TTypedInputProps = {
    param: TDagNamedParam;
    register: UseFormRegister<TDagParamsFormFields>;
};
function TypedInput({ param, register }: TTypedInputProps) {
    switch (param.schema.type) {
        case "string":
            return (
                <input
                    type="text"
                    {...register(param.name)}
                    defaultValue={param.value}
                />
            );
        case "integer":
            return (
                <input
                    type="number"
                    defaultValue={param.value}
                    {...register(param.name, { valueAsNumber: true })}
                />
            );
        default:
            return (
                <input
                    type="text"
                    defaultValue={param.value}
                    {...register(param.name)}
                />
            );
    }
}

function DagTrigger() {
    const { dagId } = useParams();
    const navigate = useNavigate();
    const [dagParams, setDagParams] = useState<TDagNamedParam[]>([]);

    let { register, handleSubmit } = useForm<TDagParamsFormFields>();

    let fetchDagParams = async () => {
        try {
            const res = await fetch(`/api/dags/${dagId}/details`);

            if (!res.status.toString().startsWith("2")) {
                throw new Error(
                    `There was an error fetching the params. Status code: ${res.status}`
                );
            }

            const details: TDagDetail = await res.json();

            setDagParams(
                Object.entries(details.params).map(
                    ([key, param]): TDagNamedParam => {
                        return { name: key, ...param };
                    }
                )
            );
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
        }
    };

    useEffect(() => {
        fetchDagParams();
    }, []);

    let onSubmit: SubmitHandler<TDagParamsFormFields> = async (data) => {
        try {
            console.log(data);
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

            console.log(await response.json());
            navigate(`/dags/${dagId}`);
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            }
        }
    };

    return (
        <>
            <BackButton />
            <h1> {dagId} </h1>
            <h2> Trigger a new DAG run</h2>
            <form
                className={s.triggerFormWrapper}
                onSubmit={handleSubmit(onSubmit)}
            >
                {dagParams.map((param) => {
                    return (
                        <Fragment key={`${param.name}`}>
                            <label>{param.name}</label>
                            <TypedInput param={param} register={register} />
                        </Fragment>
                    );
                })}

                <Button
                    variant="text"
                    className={clsx(s.submitButton)}
                    type="submit"
                >
                    Confirm
                </Button>
            </form>
        </>
    );
}

export default DagTrigger;
