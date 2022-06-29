import arg from "arg";

const args = arg({
    "--open": Boolean,
    "--unsafe-enable-test-api": Boolean,
});

const port = process.env.PORT || 3001;

export const config = {
    port,
    open: args["--open"],
    unsafeEnableTestApi: args["--unsafe-enable-test-api"],
};
