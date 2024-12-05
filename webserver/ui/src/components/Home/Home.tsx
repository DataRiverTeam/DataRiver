import CardContainer from "./components/CardContainer/CardContainer";
import CardLink from "./components/CardLink/CardLink";

function Home() {
    return (
        <>
            <h2> Named Entity Recognition</h2>
            <CardContainer>
                <CardLink
                    title="File import"
                    linkTo="/ner/dashboard/mailbox"
                    description="Manage file sensors and upload files"
                />
                <CardLink
                    title="Split files"
                    linkTo="/ner/dashboard/map_files"
                    description="Monitor splitting uploaded documents into batches"
                />
                <CardLink
                    title="Process files"
                    linkTo="/ner/dashboard/ner_files"
                    description="Monitor file processing"
                />
            </CardContainer>

            <h2> Image processing</h2>
            <CardContainer>
                <CardLink
                    title="Create batches"
                    linkTo="/images/dashboard/map_files"
                    description="Monitor splitting images from dataset into batches"
                />
                <CardLink
                    title="Process images"
                    linkTo="/images/dashboard/process_images"
                    description="Process files"
                />
            </CardContainer>
        </>
    );
}

export default Home;
