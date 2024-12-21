import { TDagStateValues } from "../../types/airflow";
import { UseFormReturn } from "react-hook-form";

import s from "./DagRunFilterForm.module.css";
import { TDagRunFilterFields } from "../../utils/dags";
import Button from "../Button/Button";
import { FormEventHandler } from "react";

type TDagRunFilterFormProps = {
    form: UseFormReturn<TDagRunFilterFields>;
    onSubmit: FormEventHandler<HTMLFormElement>;
};

function DagRunFilterForm({ form, onSubmit }: TDagRunFilterFormProps) {
    const { register } = form;

    return (
        <form className={s.formWrapper} onSubmit={onSubmit}>
            <div className={s.formFieldWrapper}>
                <label>State</label>
                <select className={s.formField} {...register("state")}>
                    <option value={""}> - </option>
                    {TDagStateValues.map((value) => (
                        <option key={`filter-${value}`} value={value}>
                            {value}
                        </option>
                    ))}
                </select>
            </div>
            <div className={s.formFieldWrapper}>
                <label>DAG run ID</label>
                <input
                    type="text"
                    className={s.formField}
                    {...register("dagRunId")}
                />
            </div>
            <div className={s.formFieldWrapper}>
                <label>Parent DAG run ID</label>
                <input
                    type="text"
                    className={s.formField}
                    {...register("parentDagRunId")}
                />
            </div>
            <Button type="submit"> Filter </Button>
        </form>
    );
}

export default DagRunFilterForm;
