import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

async function ensureFile(fileName, defaultData) {
    const filePath = path.join(dataDir, fileName);

    try {
        await fs.access(filePath);
    } catch {
        await fs.writeFile(
            filePath,
            JSON.stringify(defaultData, null, 2)
        );
    }

    return filePath;
}

async function read(fileName, defaultData = []) {
    const filePath = await ensureFile(fileName, defaultData);

    const raw = await fs.readFile(filePath, "utf8");

    return JSON.parse(raw);
}

async function write(fileName, data) {
    const filePath = await ensureFile(fileName, data);

    await fs.writeFile(
        filePath,
        JSON.stringify(data, null, 2)
    );

    return true;
}

async function append(fileName, item) {
    const data = await read(fileName);

    data.push(item);

    await write(fileName, data);

    return item;
}

async function update(fileName, predicate, updater) {

    const data = await read(fileName);

    const updated = data.map(item => {

        if (predicate(item)) {
            return updater(item);
        }

        return item;

    });

    await write(fileName, updated);

    return updated;

}

async function remove(fileName, predicate) {

    const data = await read(fileName);

    const filtered = data.filter(item => !predicate(item));

    await write(fileName, filtered);

    return true;

}

export const localAzureStorage = {

    read,

    write,

    append,

    update,

    remove

};
