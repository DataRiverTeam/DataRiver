import FileUploadForm from "../FileUploadForm/FileUploadForm";
import BackButton from "../BackButton/BackButton";
import ProcessedFilesSection from "./components/ProcessedFilesSection/ProcessedFilesSection";

function NerDashboard() {
    // let [errorMessage, setErrorMessage] = useState("");

    return (
        <>
            <BackButton to="/" />
            <h1> Named entity recognition </h1>
            <h2> Importing files </h2>

            <FileUploadForm directory={"map"} />
            <ProcessedFilesSection />
        </>
    );
}

export default NerDashboard;
