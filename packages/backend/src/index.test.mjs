import childProcess from "node:child_process";
import path from "node:path";
import url from "node:url";
import got from "got";

let cliProcess;

const PORT = 3002;

describe("index", () => {
    beforeEach(() => {
        const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

        const indexModulePath = path.resolve(
            __dirname,
            "..",
            "dist",
            "index.mjs",
        );
        const args = ["--unsafe-enable-test-api"];
        const nodePath = process.argv[0];
        cliProcess = childProcess.spawn(nodePath, [indexModulePath, ...args], {
            env: { PORT },
        });
        cliProcess.stderr.on("data", (data) => {
            console.error(`stderr: ${data}`);
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
            /^attachment; filename="pino-preview_export_.*\.jsonl"$/,
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
                    msg: "test1",
                    package: "not-json",
                    time: expect.any(Number),
                },
                {
                    msg: "test2",
                    package: "not-json",
                    time: expect.any(Number),
                },
                {
                    msg: "",
                    package: "not-json",
                    time: expect.any(Number),
                },
                {
                    msg: "test3",
                    package: "not-json",
                    time: expect.any(Number),
                },
            ],
        });
    });

    it("correctly sanitizes input", async () => {
        cliProcess.stdin.write(
            " some prefix | " +
                JSON.stringify({ test: "test-1" }) +
                " | some postfix " +
                "\n",
        );
        const res = await got.get(`http://localhost:${PORT}/api/test/messages`);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body)).toEqual({
            values: [{ test: "test-1" }],
        });
    });
});
