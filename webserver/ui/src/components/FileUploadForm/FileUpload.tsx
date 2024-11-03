import { useState } from "react";

function FileUploadForm() {
    let [files, setFiles] = useState<FileList | null>(null);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData();

        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files.item(i)!;
                formData.append("files", file, file.name);
            }

            let response = await fetch(`/files`, {
                method: "POST",
                body: formData,
            });

            try {
                console.log(await response.json());
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
            <input type="file" multiple onChange={handleChange} />
            <input type="submit" value="Upload" />
        </form>
    );
}

export default FileUploadForm;
