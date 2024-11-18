import { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Pagination from "@mui/material/Pagination";

import s from "./ImageBrowser.module.css";

type TImageThumbnailEntry = {
    id: string;
    thumbnail: string;
};

const ITEMS_PER_PAGE = 20;

function ImageBrowser() {
    let [images, setImages] = useState<TImageThumbnailEntry[]>([]);
    let [page, setPage] = useState<number>(1);
    let [errorMessage, setErrorMessage] = useState<string | null>(null);
    let [totalFound, setTotalFound] = useState(0);

    const fetchImages = async () => {
        try {
            const response = await fetch(
                `/api/images/thumbnails?start=${(page - 1) * ITEMS_PER_PAGE}`
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
    }, [page]);

    const handlePageChange = (
        _event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setPage(value);
    };

    return (
        <div>
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
