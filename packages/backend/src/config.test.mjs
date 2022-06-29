import { jest } from "@jest/globals";

const argv = [...process.argv];
const env = { ...process.env };

describe("config", () => {
    beforeEach(() => {
        process.argv = argv;
        process.env = env;
        jest.resetModules();
    });

    it("gives defaults for all options", async () => {
        const { config } = await import("../dist/config.mjs");
        expect(config).toEqual({
            open: undefined,
            port: 3001,
            unsafeEnableTestApi: undefined,
        });
    });

    it("supports --port", async () => {
        // --port should take precedence over PORT env var
        process.env = { ...env, PORT: "3003" };
        process.argv = [...argv, "--port", "3002"];
        const { config } = await import("../dist/config.mjs");
        expect(config).toEqual({
            port: 3002,
        });
    });

    it("supports PORT env variable", async () => {
        process.env = { ...env, PORT: "3003" };
        const { config } = await import("../dist/config.mjs");
        expect(config).toEqual({
            port: 3003,
        });
    });

    it("supports --open", async () => {
        process.argv = [...argv, "--open"];
        const { config } = await import("../dist/config.mjs");
        expect(config).toEqual({
            open: true,
            port: 3001,
        });
    });

    it("supports --unsafe-enable-test-api", async () => {
        process.argv = [...argv, "--unsafe-enable-test-api"];
        const { config } = await import("../dist/config.mjs");
        expect(config).toEqual({
            port: 3001,
            unsafeEnableTestApi: true,
        });
    });

    it("rejects unknown args", () => {
        process.argv = [...argv, "--unknown-argument"];
        expect(async () => {
            await import("../dist/config.mjs");
        }).rejects.toThrowError("unknown or unexpected option");
    });
});
