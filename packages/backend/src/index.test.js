const got = require("got");
const childProcess = require("child_process");
const path = require("path");

let cliProcess;

const PORT = 3002;

describe("index", () => {
    beforeEach(() => {
        const indexModulePath = path.resolve(__dirname, "index.js");
        const args = ["--unsafe-enable-test-api"];
        const nodePath = process.argv[0];
        cliProcess = childProcess.spawn(nodePath, [indexModulePath, ...args], {
            env: { PORT },
        });
    });

    afterEach(() => {
        cliProcess?.kill();
    });

    it("creates an HTTP server at env.PORT", async () => {
        const res = await got.get(`http://localhost:${PORT}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.slice(0, 15)).toEqual("<!DOCTYPE html>");
    });

    it("allows exporting data", async () => {
        cliProcess.stdin.write(JSON.stringify({ test: "test-1" }) + "\n");
        cliProcess.stdin.write(JSON.stringify({ test: "test-2" }) + "\n");
        // await new Promise((resolve) => setTimeout(resolve, 500));
        const res = await got.get(`http://localhost:${PORT}/api/export`);
        expect(res.statusCode).toBe(200);
        expect(res.headers["content-disposition"]).toMatch(
            /^attachment; filename="json-log-preview_export_.*\.jsonl"$/,
        );
        expect(res.body).toEqual(`{"test":"test-1"}\n{"test":"test-2"}\n`);
    });

    it("correctly processes empty lines", async () => {
        cliProcess.stdin.write("test1\ntest2\n");
        cliProcess.stdin.write("\n");
        cliProcess.stdin.write("test3\n");
        const res = await got.get(`http://localhost:${PORT}/api/test/messages`);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body)).toEqual({
            values: [
                {
                    message: "test1",
                    package: "not-json",
                    time: expect.any(Number),
                },
                {
                    message: "test2",
                    package: "not-json",
                    time: expect.any(Number),
                },
                {
                    message: "",
                    package: "not-json",
                    time: expect.any(Number),
                },
                {
                    message: "test3",
                    package: "not-json",
                    time: expect.any(Number),
                },
            ],
        });
    });
});
