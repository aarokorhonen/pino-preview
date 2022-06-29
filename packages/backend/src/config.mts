import arg from "arg";

const args = arg({
    "--open": Boolean,
    "--unsafe-enable-test-api": Boolean,
    "--port": Number,
});

const defaultPort = 3001;
const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;
const port = args["--port"] ?? envPort ?? defaultPort;

export const config = {
    port,
    open: args["--open"],
    unsafeEnableTestApi: args["--unsafe-enable-test-api"],
};
