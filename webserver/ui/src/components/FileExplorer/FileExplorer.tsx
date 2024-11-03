import { useEffect, useState } from "react";
import FileUploadForm from "../FileUploadForm/FileUploadForm";

type TFileType = "file" | "directory";

type Dirent = {
    name: string;
    parentPath: string;
    type: TFileType;
};

type TFile = {
    name: string;
    type: TFileType;
};

type TFileMap = {
    [key: string]: TFile[];
};

function addEntry(entryList: TFileMap, entry: Dirent) {
    const { parentPath } = entry;
    if (entry.type === "directory") {
        entryList[joinPaths(entry.parentPath, entry.name)] = [];
    }

    if (!entryList.hasOwnProperty(parentPath)) {
        entryList[parentPath] = [];
    }

    entryList[parentPath].push(entry);

    return entryList;
}

function getParentDir(path: string) {
    const segments = path.split("/");
    segments.pop();

    if (segments.length === 1 && segments[0] === "") {
        return "/";
    }

    return segments.join("/");
}

function joinPaths(base: string, name: string) {
    return base === "/" ? base + name : [base, name].join("/");
}

function FileExplorer() {
    let [files, setFiles] = useState<TFileMap>({});
    let [errorMessage, setErrorMessage] = useState("");
    let [currentDir, setCurrentDir] = useState<string>("");

    const fetchFiles = async () => {
        try {
            const response = await fetch("/api/files");
            const data: Dirent[] = await response.json();

            console.log(data);
            setFiles(data.reduce(addEntry, {}));
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            }
        }
    };

    const changeDir = (path: string) => {
        if (files.hasOwnProperty(path)) {
            setCurrentDir(path);
        } else {
            console.log(files);
            console.log(path);

            setCurrentDir("/");
            alert("The specified directory doesn't exist!");
        }
    };

    useEffect(() => {
        fetchFiles();

        setCurrentDir("/");
    }, []);

    return (
        <>
            <h1> Browse files</h1>
            <button onClick={fetchFiles}>Refresh</button>
            <h2> {currentDir} </h2>
            {Object.keys(files).length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td>type</td>
                        </tr>
                    </thead>
                    <tbody>
                        {currentDir !== "/" ? (
                            <tr>
                                <td
                                    onClick={() => {
                                        changeDir(getParentDir(currentDir));
                                    }}
                                >
                                    <a href="#">..</a>
                                </td>
                            </tr>
                        ) : null}
                        {files[currentDir].map((item) => (
                            <tr key={`${currentDir}/${item.name}`}>
                                <td
                                    onClick={
                                        item.type === "directory"
                                            ? () => {
                                                  changeDir(
                                                      joinPaths(
                                                          currentDir,
                                                          item.name
                                                      )
                                                  );
                                              }
                                            : undefined
                                    }
                                >
                                    {item.type == "directory" ? (
                                        <a href="#">{item.name}</a>
                                    ) : (
                                        item.name
                                    )}
                                </td>
                                <td>{item.type}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                "No files found"
            )}

            {errorMessage.length ? (
                errorMessage
            ) : (
                <FileUploadForm directory={currentDir} />
            )}
        </>
    );
}

export default FileExplorer;
