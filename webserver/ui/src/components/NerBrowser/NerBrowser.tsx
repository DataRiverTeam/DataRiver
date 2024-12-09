import { useEffect, useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";

import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";

import { TParsedNerDocProps, TFailedNerDocProps } from "../../types/ner";

import s from "./NerBrowser.module.css";
import NerCardsList from "./components/NerCardsList/NerCardsList";
import BackButton from "../BackButton/BackButton";

type TNerFormFields = {
    content: string;
    ners: { value: string }[];
    lang: string;
    mapFileRunId: string;
    nerSingleFileRunId: string;
};

function NerBrowser() {
    let [docs, setDocs] = useState<(TParsedNerDocProps | TFailedNerDocProps)[]>(
        []
    );
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
                let { content, ners, lang, mapFileRunId, nerSingleFileRunId } = data;

                Object.assign(queryObject, {
                    ...(content.trim().length > 0 ? { text: content } : null),
                    ...(mapFileRunId.trim().length > 0
                        ? { "map-file-run-id": mapFileRunId }
                        : null),
                    ...(nerSingleFileRunId.trim().length > 0
                        ? { "ner-single-file-run-id": nerSingleFileRunId }
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
            <BackButton to={"/"} />
            <h1> Documents </h1>

            <div className={s.filtersWrapper}>
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
                        <label>Map file dag run id</label>
                        <input type="text" {...register("mapFileRunId")} />
                    </div>
                    <div className={s.filtersItem}>
                        <label>Ner run id</label>
                        <input type="text" {...register("nerSingleFileRunId")} />
                    </div>
                    <label>Named entities</label>
                    {fields.map((_field, index) => (
                        <div className={s.filtersItem} key={`ners-${index}`}>
                            <input
                                type="text"
                                {...register(`ners.${index}.value`)}
                            />
                            <IconButton
                                sx={{ color: "white" }}
                                onClick={() => {
                                    remove(index);
                                }}
                            >
                                <ClearIcon />
                            </IconButton>
                        </div>
                    ))}
                    <IconButton
                        sx={{ color: "white" }}
                        onClick={() => {
                            append({ value: "" });
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                    <Button
                        variant="outlined"
                        className={s.filterSubmit}
                        type="submit"
                    >
                        Filter
                    </Button>
                </form>
            </div>
            <div className={s.docsListWrapper}>
                {isLoading ? (
                    <span> Loading...</span>
                ) : (
                    <>
                        <p>Found {totalFound} matching results.</p>
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

                                <NerCardsList docs={docs} />

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
                    </>
                )}
            </div>
        </>
    );
}

export default NerBrowser;
