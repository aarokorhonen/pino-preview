var _a, _b, _c;
import arg from "arg";
const args = arg({
    "--open": Boolean,
    "--unsafe-enable-test-api": Boolean,
    "--port": Number,
    "--output": String,
});
const defaultPort = 3001;
const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;
const port = (_b = (_a = args["--port"]) !== null && _a !== void 0 ? _a : envPort) !== null && _b !== void 0 ? _b : defaultPort;
const unsafeEnableTestApi = args["--unsafe-enable-test-api"];
const exitOnStdinEnd = !unsafeEnableTestApi;
const output = (_c = args["--output"]) !== null && _c !== void 0 ? _c : "quiet";
if (output !== "quiet" && output !== "pipe")
    throw new Error("Invalid value for --output. Supported values: '--output=quiet' (logs only visible in the web viewer), '--output=pipe' are allowed.");
export const config = {
    port,
    open: args["--open"],
    unsafeEnableTestApi,
    exitOnStdinEnd,
    output,
};
