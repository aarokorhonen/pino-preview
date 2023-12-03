var _a, _b;
import arg from "arg";
const args = arg({
    "--open": Boolean,
    "--unsafe-enable-test-api": Boolean,
    "--port": Number,
});
const defaultPort = 3001;
const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;
const port = (_b = (_a = args["--port"]) !== null && _a !== void 0 ? _a : envPort) !== null && _b !== void 0 ? _b : defaultPort;
const unsafeEnableTestApi = args["--unsafe-enable-test-api"];
const exitOnStdinEnd = !unsafeEnableTestApi;
export const config = {
    port,
    open: args["--open"],
    unsafeEnableTestApi,
    exitOnStdinEnd,
};
