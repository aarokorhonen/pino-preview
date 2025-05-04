import express from "express";
import { pushNewValues, values, wss } from "./index.mjs";
export const testApiRouter = express.Router();
testApiRouter.use(express.json());
testApiRouter.get("/api/test/messages", (_req, res) => {
    res.json({ values });
});
testApiRouter.post("/api/test/messages", (req, res) => {
    try {
        for (const value of req.body.messages) {
            if (typeof value !== "object" || value === null) {
                throw new Error("Not object");
            }
            else {
                pushNewValues([value]);
            }
        }
        res.json({ status: "ok" });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ status: "error" });
    }
});
testApiRouter.post("/api/test/reset", (req, res) => {
    for (const client of wss.clients) {
        client.close();
    }
    values.length = 0;
    res.json({ status: "ok" });
});
