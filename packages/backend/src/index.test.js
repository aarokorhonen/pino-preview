const got = require("got");
const childProcess = require("child_process");
const path = require("path");

let cliProcess;

describe("index", () => {
    it("creates an HTTP server at env.PORT", async () => {
        const indexModulePath = path.resolve(__dirname, "index.js");
        const nodePath = process.argv[0];
        const PORT = 3002;
        cliProcess = childProcess.spawn(nodePath, [indexModulePath], {
            env: { PORT },
        });
        const res = await got.get(`http://localhost:${PORT}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.slice(0, 15)).toEqual("<!DOCTYPE html>");
    });

    afterEach(() => {
        cliProcess?.kill();
    });
});
