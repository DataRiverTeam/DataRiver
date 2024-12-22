import { useEffect, useState, Fragment } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";

import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Pagination from "@mui/material/Pagination";
import Button from "@mui/material/Button";

import s from "./ImageBrowser.module.css";

type TImageThumbnailEntry = {
    id: string;
    thumbnail: string;
};

type TImageFormFields = {
    description: string;
    transformDagRunId: string;
    processDagRunId: string;
    dateRangeFrom: string;
    dateRangeTo: string;
};

const ITEMS_PER_PAGE = 20;

function formToQueryString(data: TImageFormFields | null, pageNumber: number) {
    let queryObject = {
        page: pageNumber.toString(),
    };

    if (data) {
        let {
            transformDagRunId,
            processDagRunId,
            description,
            dateRangeTo,
            dateRangeFrom,
        } = data;

        Object.assign(queryObject, {
            ...(description.trim().length > 0 ? { description } : null),
            ...(transformDagRunId.trim().length > 0
                ? { "image-transform-dataset-run-id": transformDagRunId }
                : null),
            ...(processDagRunId.trim().length > 0
                ? { "image-process-run-id": processDagRunId }
                : null),
            ...(dateRangeFrom ? { "date-range-from": dateRangeFrom } : null),
            ...(dateRangeTo ? { "date-range-to": dateRangeTo } : null),
        });
    }

    let queryString = new URLSearchParams(queryObject).toString();

    return queryString;
}

function ImageBrowser() {
    let [searchParams, setSearchParams] = useSearchParams();
    let [images, setImages] = useState<TImageThumbnailEntry[]>([]);
    let [page, setPage] = useState<number>(
        parseInt(searchParams.get("page") || "1") || 1
    );
    let [errorMessage, setErrorMessage] = useState<string | null>(null);
    let [totalFound, setTotalFound] = useState(0);

    let [currentFormData, setCurrentFormData] =
        useState<TImageFormFields | null>(null);

    let { register, handleSubmit, getValues, setValue } =
        useForm<TImageFormFields>();

    const fetchImages = async (
        data: TImageFormFields | null,
        pageNumber: number
    ) => {
        try {
            const queryString = formToQueryString(data, pageNumber);
            console.log("queryString:", queryString);

            const response = await fetch(
                `/api/images/thumbnails?${queryString}`
            );

            if (!response.status.toString().startsWith("2")) {
                throw Error(
                    `A server error occured when handling the request. Status code: ${response.status}`
                );
            }

            const json = await response.json();

            setTotalFound(json.hits.total.value);
            setImages(
                json.hits.hits.map((item: any) => ({
                    id: item._id,
                    thumbnail: item._source.thumbnail,
                }))
            );
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                setErrorMessage(error.message);
            }
        }
    };

    useEffect(() => {
        if (searchParams.has("description")) {
            setValue("description", searchParams.get("description")!);
        }
        if (searchParams.has("date-range-from")) {
            setValue("dateRangeFrom", searchParams.get("date-range-from")!);
        }
        if (searchParams.has("date-range-to")) {
            setValue("dateRangeTo", searchParams.get("date-range-to")!);
        }
        if (searchParams.has("image-transform-dataset-run-id")) {
            setValue(
                "transformDagRunId",
                searchParams.get("image-transform-dataset-run-id")!
            );
        }
        if (searchParams.has("image-process-run-id")) {
            setValue(
                "processDagRunId",
                searchParams.get("image-process-run-id")!
            );
        }
        fetchImages(getValues(), page);
    }, [currentFormData, page]);

    const handlePageChange = (
        _event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setSearchParams(
            formToQueryString(currentFormData || getValues(), value)
        );
        setPage(value);
    };

    let onSubmit: SubmitHandler<TImageFormFields> = (data) => {
        setPage((_) => 1);
        setSearchParams(formToQueryString(data, 1));
        setCurrentFormData(data);
    };

    return (
        <div>
            <div className={s.filtersWrapper}>
                <form
                    id="filter-images"
                    className={s.filters}
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className={s.filtersItem}>
                        <label>Description</label>
                        <input type="text" {...register("description")} />
                    </div>
                    <div className={s.filtersItem}>
                        <label>Dataset transform DAG run ID</label>
                        <input type="text" {...register("transformDagRunId")} />
                    </div>
                    <div className={s.filtersItem}>
                        <label>Image processing DAG run ID</label>
                        <input type="text" {...register("processDagRunId")} />
                    </div>
                    <fieldset className={s.filters}>
                        <legend>Processing start date range</legend>
                        <div className={s.filtersItem}>
                            <label>From:</label>
                            <input
                                type="datetime-local"
                                {...register("dateRangeFrom")}
                            />
                        </div>
                        <div className={s.filtersItem}>
                            <label>To:</label>
                            <input
                                type="datetime-local"
                                {...register("dateRangeTo")}
                            />
                        </div>
                    </fieldset>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <Button
                            variant="outlined"
                            className={s.filterSubmit}
                            type="submit"
                        >
                            Filter
                        </Button>
                        <Button
                            variant="outlined"
                            className={s.filterSubmit}
                            type="reset"
                            onClick={() => setSearchParams({})}
                        >
                            Clear
                        </Button>
                    </div>
                </form>
            </div>

            {!errorMessage ? (
                <>
                    <p className={s.totalFoundMessage}>
                        {totalFound > 0
                            ? `Found ${totalFound} matching images.`
                            : "No images to display."}
                    </p>
                    <ImageList cols={4}>
                        {images.map((item) => {
                            return (
                                <Fragment key={item.id}>
                                    <ImageListItem>
                                        {item?.thumbnail ? (
                                            <img
                                                src={`data:image/png;base64, ${item.thumbnail}`}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <img
                                                src="/no_thumbnail.svg"
                                                loading="lazy"
                                            />
                                        )}
                                        <ImageListItemBar
                                            title={item.id}
                                            actionIcon={
                                                <Link to={`/images/${item.id}`}>
                                                    <IconButton
                                                        sx={{
                                                            color: "rgba(255, 255, 255, 0.54)",
                                                        }}
                                                        aria-label={`Details of ${item.id}.`}
                                                    >
                                                        <ArrowForwardIcon />
                                                    </IconButton>
                                                </Link>
                                            }
                                        />
                                    </ImageListItem>
                                </Fragment>
                            );
                        })}
                    </ImageList>
                </>
            ) : (
                <p>{errorMessage}</p>
            )}
            <div className={s.paginatorWrapper}>
                <Pagination
                    classes={{
                        ul: s.paginatorList,
                    }}
                    color="primary"
                    count={Math.ceil(totalFound / ITEMS_PER_PAGE)}
                    page={page}
                    onChange={handlePageChange}
                />
            </div>
        </div>
    );
}

export default ImageBrowser;
