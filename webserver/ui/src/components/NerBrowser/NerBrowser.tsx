import { useState } from "react";
import { TNerDoc } from "../../types/ner";
import NerCard from "../NerCard/NerCard";

import s from "./NerBrowser.module.css";

function NerBrowser() {
    let [docs, setDocs] = useState<TNerDoc[]>([]);
    let [isLoading, setIsLoading] = useState(false);
    let [textQuery, setTextQuery] = useState("");
    let [_errorMessage, setErrorMessage] = useState("");

    function getDocs() {
        fetch(`/api/ner/docs?text=${textQuery}`)
            .then((res) => res.json())
            .then((json) => {
                setIsLoading(false);
                setDocs(json.hits.hits.map((item: any) => item._source));
            })
            .catch((err) => {
                setErrorMessage(err);
                setIsLoading(false);
            });
    }

    return (
        <>
            <h1> Find documents </h1>
            <div id="filter-text" className={s.filters}>
                <label htmlFor="textFragment">Searched phrase</label>
                <input
                    type="text"
                    name="textFragment"
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                />
                <input
                    type="submit"
                    value="Filter"
                    onClick={() => {
                        setIsLoading(true);
                        getDocs();
                    }}
                />
            </div>
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
                        Found {docs.length} matching results.
                        {docs.map((item) => (
                            <NerCard item={item} />
                        ))}
                    </>
                )}
            </div>
        </>
    );
}

export default NerBrowser;
