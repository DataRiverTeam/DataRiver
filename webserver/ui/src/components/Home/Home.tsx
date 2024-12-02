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
                {/* <CardLink
                    title="Split files"
                    linkTo="/dags/mailbox"
                    description="Monitor batching of the uploaded documents"
                />
                <CardLink
                    title="Process files"
                    linkTo="/dags/mailbox"
                    description="Monitor batch processing"
                /> */}
            </CardContainer>

            <h2> Image processing</h2>
            <CardContainer>
                {/* <CardLink
                    title="Create batches"
                    linkTo="/dags/map_file_images"
                    description="Create batches"
                />
                <CardLink
                    title="Process images"
                    linkTo="/dags/image_workflow"
                    description="Process files"
                /> */}
            </CardContainer>
        </>
    );
}

export default Home;
