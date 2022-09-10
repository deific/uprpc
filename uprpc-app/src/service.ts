import * as store from "./storage/store";
import { BrowserWindow, ipcMain } from "electron";
import * as electron from "electron";
import * as client from "./rpc/client";
import { RequestData, ResponseData, CloseStreamData, isCloseStreamData } from "./types";

const { loadProto } = require("./proto/parser");

export async function importFile() {
    const result = await electron.dialog.showOpenDialog({
        title: "Import File",
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "proto", extensions: ["proto"] }],
    });

    if (result.canceled) {
        return { success: true };
    }

    for (let path of result.filePaths) {
        try {
            let proto = await loadProto(path);
            store.addFile(proto);
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    }
    return { success: true };
}

export function listFiles() {
    return JSON.stringify(store.getFiles());
}

export function getPaths(): string[] {
    return store.getPaths();
}

export async function addPath() {
    const result = await electron.dialog.showOpenDialog({
        title: "Import Paths",
        properties: ["openDirectory"],
    });

    if (result.canceled) {
        return { success: false };
    }

    let paths = store.getPaths();
    let path = result.filePaths[0];
    if (paths.indexOf(path) == -1) {
        paths.push(path);
        store.savePaths(paths);
    }

    return { success: true, paths: paths };
}

export function removePath(path: string) {
    console.log("remove ", path);
    let paths = store.getPaths();
    paths.forEach((value, index) => {
        if (value == path) {
            paths.splice(index, 1);
        }
    });
    store.savePaths(paths);
}

export async function sendRequest(window: BrowserWindow, req: RequestData) {
    // let req: RequestData = JSON.parse(reqData);
    await client.send(req, (res: ResponseData | null, err: Error | undefined) => {
        returnResponse(window, req, res, err);
    });
}

export async function stopStream(window: BrowserWindow, id: string) {
    await client.stop(id, (res: ResponseData | null, err: Error | undefined) => {
        console.log("stop {} {},err:{} ", id, !!err, err?.message);
    });
}

function returnResponse(window: BrowserWindow, req: RequestData, res: any, e?: Error, closeStream?: boolean): void {
    console.log("return response ", res);
    if (closeStream) {
        window.webContents.send("endStream", {
            id: req.id,
            body: e?.message,
            metadata: JSON.stringify(res, null, "\t"),
        });
    } else {
        window.webContents.send("updateResponse", {
            id: req.id,
            body: JSON.stringify(res ? res : e?.message, null, "\t"),
        });
    }
}
