import { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
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
    dagRunId: string;
    dateRangeFrom: string;
    dateRangeTo: string;
};

const ITEMS_PER_PAGE = 20;

function ImageBrowser() {
    let [images, setImages] = useState<TImageThumbnailEntry[]>([]);
    let [page, setPage] = useState<number>(1);
    let [errorMessage, setErrorMessage] = useState<string | null>(null);
    let [totalFound, setTotalFound] = useState(0);

    let [currentFormData, setCurrentFormData] =
        useState<TImageFormFields | null>(null);

    let { register, handleSubmit } = useForm<TImageFormFields>();

    const fetchImages = async () => {
        try {
            let queryObject = {
                start: ((page - 1) * ITEMS_PER_PAGE).toString(),
            };

            if (currentFormData) {
                let { dagRunId, description, dateRangeTo, dateRangeFrom } =
                    currentFormData;

                Object.assign(queryObject, {
                    //TODO: implement sending date range
                    ...(description.trim().length > 0 ? { description } : null),
                    ...(dagRunId.trim().length > 0
                        ? { "map-file-images-run-id": dagRunId }
                        : null),
                    ...(dateRangeFrom
                        ? { "date-range-from": dateRangeFrom }
                        : null),
                    ...(dateRangeTo ? { "date-range-to": dateRangeTo } : null),
                });
            }

            let queryString = new URLSearchParams(queryObject).toString();
            console.log(queryString);
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
        fetchImages();
    }, [page, currentFormData]);

    const handlePageChange = (
        _event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setPage(value);
    };

    let onSubmit: SubmitHandler<TImageFormFields> = (data) => {
        setPage(1);
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
                        <label>DAG run ID</label>
                        <input type="text" {...register("dagRunId")} />
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

                    <Button
                        variant="outlined"
                        className={s.filterSubmit}
                        type="submit"
                    >
                        Filter
                    </Button>
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
                                        <img
                                            src={`data:image/png;base64, ${item.thumbnail}`}
                                            // alt={item.id}
                                            loading="lazy"
                                        />
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
