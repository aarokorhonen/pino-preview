const argv = [...process.argv];
const env = { ...process.env };

describe("config", () => {
    beforeEach(() => {
        process.argv = argv;
        process.env = env;
        jest.resetModules();
    });

    it("gives defaults for all options", () => {
        const { config } = require("../dist/config");
        expect(config).toEqual({
            open: undefined,
            port: 3001,
            unsafeEnableTestApi: undefined,
        });
    });

    it("supports --port", () => {
        // --port should take precedence over PORT env var
        process.env = { ...env, PORT: "3003" };
        process.argv = [...argv, "--port", "3002"];
        const { config } = require("../dist/config");
        expect(config).toEqual({
            port: 3002,
        });
    });

    it("supports PORT env variable", () => {
        process.env = { ...env, PORT: "3003" };
        const { config } = require("../dist/config");
        expect(config).toEqual({
            port: 3003,
        });
    });

    it("supports --open", () => {
        process.argv = [...argv, "--open"];
        const { config } = require("../dist/config");
        expect(config).toEqual({
            open: true,
            port: 3001,
        });
    });

    it("supports --unsafe-enable-test-api", () => {
        process.argv = [...argv, "--unsafe-enable-test-api"];
        const { config } = require("../dist/config");
        expect(config).toEqual({
            port: 3001,
            unsafeEnableTestApi: true,
        });
    });

    it("rejects unknown args", () => {
        process.argv = [...argv, "--unknown-argument"];
        expect(() => {
            require("../dist/config");
        }).toThrowError("unknown or unexpected option");
    });
});
