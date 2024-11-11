import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";

import Pagination from "@mui/material/Pagination";

import { TNerDoc } from "../../types/ner";
import NerCard from "../NerCard/NerCard";

import s from "./NerBrowser.module.css";

type TNerFormFields = {
    content: string;
    ners: { value: string }[];
    lang: string;
    dagRunId: string;
};

//TODO: dynamically created inputs
//https://codesandbox.io/p/sandbox/react-hook-form-usefieldarray-ssugn?file=%2Fsrc%2Findex.tsx

function NerBrowser() {
    let [docs, setDocs] = useState<TNerDoc[]>([]);
    let [totalFound, setTotalFound] = useState<number>(0);
    let [page, setPage] = useState<number>(1);
    let [isLoading, setIsLoading] = useState(false);
    let [_errorMessage, setErrorMessage] = useState("");

    let [currentFormData, setCurrentFormData] = useState<TNerFormFields | null>(
        null
    );

    let { register, handleSubmit, control } = useForm<TNerFormFields>();
    let { fields, append, remove } = useFieldArray({
        control,
        name: "ners",
    });
    let onSubmit: SubmitHandler<TNerFormFields> = (data) => {
        setPage((_) => 1);
        setCurrentFormData(data);
        getDocs(data, 1);
    };

    async function getDocs(data: TNerFormFields | null, pageNumber: number) {
        setErrorMessage("");
        setIsLoading(true);
        try {
            let queryObject = {
                start: ((pageNumber - 1) * 10).toString(),
            };

            if (data) {
                let { content, ners, lang, dagRunId } = data;

                Object.assign(queryObject, {
                    ...(content.trim().length > 0 ? { text: content } : null),
                    ...(dagRunId.trim().length > 0
                        ? { "dag-run-id": dagRunId }
                        : null),
                    ...(lang.trim().length > 0 ? { lang } : null),
                    ...(ners.length > 0
                        ? {
                              ners: ners
                                  .map((field) => field.value.trim())
                                  .filter((value) => value.length > 0)
                                  .join(","),
                          }
                        : null),
                });
            }

            let queryString = new URLSearchParams(queryObject).toString();

            console.log(queryString);

            const response = await fetch(`/api/ner/docs?${queryString}`);

            if (!response.status.toString().startsWith("2")) {
                throw Error(
                    `A server error occured when handling the request. Status code: ${response.status}`
                );
            }

            const json = await response.json();
            setTotalFound(json.hits.total.value);
            setDocs(
                json.hits.hits.map((item: any) => ({
                    id: item._id,
                    ...item._source,
                }))
            );
        } catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getDocs(null, 1);
    }, []);

    const handlePageChange = (
        _event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setPage((_) => value);
        getDocs(currentFormData, value);
    };

    return (
        <>
            <Link to={".."} relative="path">
                Back
            </Link>
            <h1> Documents </h1>

            <form
                id="filter-text"
                className={s.filters}
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className={s.filtersItem}>
                    <label>Searched phrase</label>
                    <input type="text" {...register("content")} />
                </div>
                <div className={s.filtersItem}>
                    <label>Language code</label>
                    <input type="text" {...register("lang")} />
                </div>
                <div className={s.filtersItem}>
                    <label>Dag run id</label>
                    <input type="text" {...register("dagRunId")} />
                </div>

                <label>Named entities</label>
                {fields.map((_field, index) => (
                    <div className={s.filtersItem} key={`ners-${index}`}>
                        <input
                            type="text"
                            {...register(`ners.${index}.value`)}
                        />
                        <input
                            type="button"
                            onClick={() => {
                                remove(index);
                            }}
                            value="x"
                        />
                    </div>
                ))}

                <input
                    type="button"
                    value="+"
                    onClick={() => {
                        append({ value: "" });
                    }}
                />
                <input type="submit" value="Filter" />
            </form>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                {isLoading ? (
                    <span> Loading...</span>
                ) : (
                    <>
                        Found {totalFound} matching results.
                        {totalFound > 0 ? (
                            <>
                                <Pagination
                                    classes={{
                                        ul: s.paginatorList,
                                    }}
                                    color="primary"
                                    count={Math.ceil(totalFound / 10)}
                                    page={page}
                                    onChange={handlePageChange}
                                />
                            </>
                        ) : null}
                        {docs.map((item) => (
                            <NerCard key={item.id} item={item} />
                        ))}
                    </>
                )}

                {totalFound > 0 ? (
                    <>
                        <Pagination
                            classes={{
                                ul: s.paginatorList,
                            }}
                            color="primary"
                            count={Math.ceil(totalFound / 10)}
                            page={page}
                            onChange={handlePageChange}
                        />
                    </>
                ) : null}
            </div>
        </>
    );
}

export default NerBrowser;
