const fs = require("fs/promises");

async function getFiles(path) {
    const files = await fs.readdir(path, {
        withFileTypes: true,
        recursive: true,
    });

    const mapped = files.map((item) => {
        console.log(item);

        let newPath = item.parentPath.replaceAll("\\", "/");

        if (item.parentPath.startsWith("./")) {
            newPath = newPath.slice(2);
        }

        return {
            name: item.name,
            parentPath: newPath,
            type: item.isDirectory() ? "directory" : "file",
        };
    });

    return mapped;
}

module.exports = {
    getFiles,
};
