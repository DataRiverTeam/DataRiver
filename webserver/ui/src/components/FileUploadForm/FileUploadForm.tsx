import { useState, useRef } from "react";
import UploadIcon from "@mui/icons-material/Upload";

import s from "./FileUploadForm.module.css";
import Button from "../Button/Button";

type TFileUploadFormProps = {
    directory?: string | null;
    onSuccess?: (() => any) | null;
};

function FileUploadForm({
    directory = null,
    onSuccess = null,
}: TFileUploadFormProps) {
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
                    if (onSuccess) onSuccess();
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

    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    return (
        <>
            <div className={s.wrapper}>
                <div className={s.innerWrapper} onClick={handleClick}>
                    <UploadIcon className={s.uploadIcon} />
                    <p>
                        {files instanceof FileList && files.length > 0
                            ? `${files.length} file(s) selected`
                            : "Click to select the files to upload."}
                    </p>
                </div>
                <form onSubmit={handleUpload}>
                    <input
                        type="file"
                        multiple
                        onChange={handleChange}
                        hidden
                        ref={fileInputRef}
                    />
                    <Button type="submit">Upload</Button>
                </form>
            </div>
        </>
    );
}

export default FileUploadForm;
