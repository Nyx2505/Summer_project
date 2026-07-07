import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA = path.join(__dirname, "../data");

async function read(file) {
    const data = await fs.readFile(path.join(DATA, file), "utf8");
    return JSON.parse(data);
}

async function write(file, data) {
    await fs.writeFile(
        path.join(DATA, file),
        JSON.stringify(data, null, 2)
    );
}

export const AzureDatabase = {

    async getControls() {
        return await read("compliance-controls.json");
    },

    async saveControls(data) {
        await write("compliance-controls.json", data);
    },

    async getTasks() {
        return await read("tasks.json");
    },

    async saveTasks(data) {
        await write("tasks.json", data);
    },

    async getScores() {
        return await read("scores.json");
    },

    async saveScores(data) {
        await write("scores.json", data);
    }

};
