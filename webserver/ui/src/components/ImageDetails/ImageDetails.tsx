import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@mui/material";

import { TImageDetails } from "../../types/image";
import BackButton from "../BackButton/BackButton";

import s from "./ImageDetails.module.css";

function ImageDetails() {
    let { imageId } = useParams();
    let [imageDetails, setImageDetails] = useState<TImageDetails | null>(null);
    let [errorMessage, setErrorMessage] = useState<string>("");
    const fetchImageDetails = async () => {
        try {
            const response = await fetch(`/api/images/${imageId}/details`);

            if (!response.status.toString().startsWith("2")) {
                throw new Error(
                    `Failed to fetch image data. Status code: ${response.status}`
                );
            }

            const json = await response.json();
            setErrorMessage("");
            setImageDetails(json.data);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                setErrorMessage(error.message);
            } else {
                setErrorMessage(JSON.stringify(error));
            }
        }
    };

    useEffect(() => {
        fetchImageDetails();
    }, []);

    return (
        <div>
            <BackButton />
            <h1> Image details </h1>
            {errorMessage.length === 0 && imageDetails ? (
                <Card className={s.imageCard}>
                    <img
                        src={`data:image/png;base64, ${imageDetails.thumbnail}`}
                        loading="lazy"
                    />
                    <h3> Description </h3>
                    <p>{imageDetails.description}</p>
                    <h3> Processing data </h3>
                    <ul>
                        <li> ID: {imageDetails.id} </li>
                        <li>
                            Source URL:{" "}
                            {imageDetails.image_path.match("^https*:") ? (
                                <a href={imageDetails.image_path}>
                                    {" "}
                                    {imageDetails.image_path}
                                </a>
                            ) : (
                                <>{imageDetails.image_path}</>
                            )}
                        </li>
                        <li> DAGRun ID: {imageDetails.dag_run_id}</li>
                        <li>
                            Processing start date: {imageDetails.dag_start_date}
                        </li>
                        <li>
                            Processing end date:{" "}
                            {imageDetails.dag_processed_date}
                        </li>
                    </ul>
                    <h3>Metadata</h3>
                    {imageDetails.metadata.length ? (
                        <>
                            <table className={s.metaDataTable}>
                                <thead>
                                    <tr>
                                        <td>Tag</td>
                                        <td>Value</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {imageDetails.metadata.map((item) => {
                                        return (
                                            <tr key={`metadana-${item.tag}`}>
                                                <td className={s.metaDataLabel}>
                                                    {item.tag}
                                                </td>
                                                <td>{item.value}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <p> No metadata to display.</p>
                    )}
                    {imageDetails.hash &&
                    Object.keys(imageDetails.hash).length > 0 ? (
                        <>
                            <h3>Hashes</h3>
                            <table className={s.hashTypesTable}>
                                <thead>
                                    <tr>
                                        <td className={s.hashTypesLabel}>
                                            Type
                                        </td>
                                        <td>Value</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(imageDetails.hash).map(
                                        (hashType) => (
                                            <tr key={`hash-${hashType}`}>
                                                <td> {hashType} </td>
                                                <td>
                                                    {
                                                        imageDetails.hash[
                                                            hashType
                                                        ]
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </>
                    ) : null}
                </Card>
            ) : (
                <p> {errorMessage}</p>
            )}
        </div>
    );
}

export default ImageDetails;
