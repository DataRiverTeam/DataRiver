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
            <BackButton to="../search" relative="path" />
            <h1> Image details </h1>
            {errorMessage.length === 0 && imageDetails ? (
                <Card className={s.imageCard}>
                    {imageDetails.thumbnail ? (
                        <img
                            src={`data:image/png;base64, ${imageDetails.thumbnail}`}
                            loading="lazy"
                        />
                    ) : (
                        <img
                            src="/no_thumbnail.svg"
                            loading="lazy"
                        />
                    )}

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
                        {imageDetails.processed_date ? (
                            <li>
                                Processing end date:{" "}
                                {imageDetails.processed_date}
                            </li>
                        ) : null}
                    </ul>
                    <h3>Dags info</h3>
                    {imageDetails.dags_info &&
                    Object.keys(imageDetails.dags_info).length > 0 ? (
                        <table
                            border={1}
                            style={{
                                borderCollapse: "collapse",
                                width: "100%",
                            }}
                        >
                            <thead>
                                <tr>
                                    <th>Dag ID</th>
                                    <th>Start Date</th>
                                    <th>Run ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(imageDetails.dags_info).map(
                                    ([dag_id, value]) => (
                                        <tr key={dag_id}>
                                            <td>{dag_id}</td>
                                            <td>{value.start_date}</td>
                                            <td>{value.run_id}</td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    ) : null}
                    <h3>Metadata</h3>
                    {imageDetails.metadata ? (
                        <>
                            <table className={s.metaDataTable}>
                                <thead>
                                    <tr>
                                        <td className={s.metaDataLabel}>Tag</td>
                                        <td>Value</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {imageDetails.metadata.map((item) => {
                                        return (
                                            <tr key={`metadana-${item.tag}`}>
                                                <td
                                                    className={s.hashTypesLabel}
                                                >
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
                                        <strong> Type </strong>
                                        </td>
                                        <td><strong>Value</strong></td>
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


                {imageDetails.hash && Object.keys(imageDetails.error).length > 0 && (
                <>
                    <h3>Errors</h3>
                    <table className={s.metaDataTable}>
                    <thead>
                        <tr>
                        <td className={s.hashTypesLabel}>Task ID</td>
                        <td>Message</td>
                        </tr>
                    </thead>
                    <tbody>
                        {imageDetails.error.map((error) => (
                        <tr key={error.task_id}>
                            <td>{error.task_id}</td>
                            <td>{error.message}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </>
                )}

                </Card>
            ) : (
                <p> {errorMessage}</p>
            )}
        </div>
    );
}

export default ImageDetails;
