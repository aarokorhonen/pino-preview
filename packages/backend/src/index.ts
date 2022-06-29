import path from "path";
import http from "http";
import express from "express";
import WebSocket from "ws";
import open from "open";
import { config } from "./config";
import { testApiRouter } from "./test-api";

process.stdin.pipe(process.stdout);
process.stdin.resume();
process.stdin.setEncoding("utf8");

type Value = Record<string, unknown>;

export let values: Value[] = [];

process.stdin.on("data", (data: string) => {
    const rawLines = data.replace(/\n$/, "").split("\n");
    const lines = rawLines.map((line) => parseLine(line));
    pushNewValues(lines);
});

process.stdin.on("end", () => {
    setTimeout(() => process.exit(0), 1000);
});

let exitOnSigInt = false;
process.on("SIGINT", () => {
    if (exitOnSigInt) {
        process.exit(0);
    } else {
        exitOnSigInt = true;
        console.log("Press Ctrl-C again to exit");
    }
});

export const pushNewValues = (newValues: Value[]) => {
    values.push(...newValues);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(newValues));
        }
    });
};

const app = express();
const server = http.createServer(app);
export const wss = new WebSocket.Server({ server, path: "/api/ws" });

if (config.unsafeEnableTestApi) {
    app.use(testApiRouter);
}

app.get("/api/export", (req, res) => {
    const data = values.map((v) => JSON.stringify(v) + "\n").join("");
    const filename = `json-log-preview_export_${new Date().toISOString()}.jsonl`;
    res.attachment(filename);
    res.send(data);
});

app.get("*", express.static(path.join(__dirname, "..", "public")));

wss.on("connection", (ws) => {
    ws.send(JSON.stringify(values));
});

server.listen(config.port, () => {
    const url = `http://localhost:${config.port}`;
    console.log(`[json-log-preview] Server listening at ${url}`);
    if (config.open) {
        void open(url);
    }
});

const parseLine = (line: string) => {
    try {
        const value = JSON.parse(line);
        if (typeof value !== "object" || value === null) {
            throw new Error("Not object");
        } else {
            return value;
        }
    } catch (err) {
        const newValue = {
            time: Date.now(),
            package: "not-json",
            message: line,
        };
        return newValue;
    }
};
