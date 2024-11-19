import { Link } from "react-router-dom";

function ProcessedFilesSection() {
    return (
        <>
            <h2> Processed files</h2>
            <Link to="/ner/search">Go to docs browser</Link>
        </>
    );
}

export default ProcessedFilesSection;
