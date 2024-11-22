import FileUploadForm from "../FileUploadForm/FileUploadForm";
import BackButton from "../BackButton/BackButton";
import ProcessedFilesSection from "./components/ProcessedFilesSection/ProcessedFilesSection";
import FileImportSection from "./components/FileImportSection/FileImportSection";
function NerDashboard() {
    return (
        <>
            <BackButton to="/" />
            <h1> Named entity recognition </h1>
            <FileImportSection />
            <FileUploadForm directory={"map"} />
            <ProcessedFilesSection />
        </>
    );
}

export default NerDashboard;
