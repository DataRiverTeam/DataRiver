import CardContainer from "./components/CardContainer/CardContainer";
import CardLink from "./components/CardLink/CardLink";

function Home() {
    return (
        <>
            <h2> Named Entity Recognition</h2>
            <CardContainer>
                <CardLink
                    title="Import dataset"
                    linkTo="/ner/dashboard/ner_mailbox"
                    description="Manage file sensors and upload files"
                />
                <CardLink
                    title="Split dataset"
                    linkTo="/ner/dashboard/ner_transform_dataset"
                    description="Monitor splitting uploaded documents into batches"
                />
                <CardLink
                    title="Process files"
                    linkTo="/ner/dashboard/ner_process"
                    description="Monitor file processing"
                />
            </CardContainer>

            <h2> Image processing</h2>
            <CardContainer>
                <CardLink
                    title="Import dataset"
                    linkTo="/images/dashboard/image_mailbox"
                    description="Manage file sensors and upload files"
                />
                <CardLink
                    title="Create batches"
                    linkTo="/images/dashboard/image_transform_dataset"
                    description="Monitor splitting images from dataset into batches"
                />
                <CardLink
                    title="Process images"
                    linkTo="/images/dashboard/image_process"
                    description="Process files"
                />
            </CardContainer>
        </>
    );
}

export default Home;
