import { useState } from "react";

type TFileUploadFormProps = {
    directory?: string | null;
};

function FileUploadForm({ directory = null }: TFileUploadFormProps) {
    let [files, setFiles] = useState<FileList | null>(null);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData();

        if (files) {
            try {
                // TODO/FIXME: investigate potential path traversal vulnerability
                // related to relative directory path
                if (directory) {
                    console.log("directory", directory);
                    formData.append("directory", directory);
                }

                // note: files need to be put into body always as the last field
                for (let i = 0; i < files.length; i++) {
                    const file = files.item(i)!;
                    formData.append("files", file, file.name);
                }

                let response = await fetch(`/files`, {
                    method: "POST",
                    body: formData,
                });

                if (response.status.toString() === "200") {
                    alert("File upload successful!");
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            alert("No files selected!");
        }
    };

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        let uploadedFiles = e.currentTarget.files;

        setFiles(uploadedFiles);
    };

    return (
        <form onSubmit={handleUpload}>
            <h3> Upload to {directory} </h3>
            <input type="file" multiple onChange={handleChange} />
            <input type="submit" value="Upload" />
        </form>
    );
}

export default FileUploadForm;
