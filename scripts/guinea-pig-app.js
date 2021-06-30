// this simple app can be used to produce varied structured logs for consumption

const pino = require("pino");

const logger = pino({ base: null }).child({
    module: "guinea-pig-app",
    hostname: undefined,
});
logger.level = "trace";

const logMessages = [
    "[Object object]",
    "A helpful diagnostics message",
    "Hello world",
    "Proceed with caution",
    "'undefined' is not a function",
    "Catastrophic failure",
    "Pressure increasing rapidly",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eget elit non tortor eleifend condimentum sit amet ac orci. Pellentesque porta pulvinar ipsum, eu varius ante fermentum eu. Proin eu malesuada magna.",
];

const logLevels = ["trace", "debug", "info", "warn", "error", "fatal"];

const packages = [
    "cabin-pressure-regulator",
    "uranium-reactor-cooling-facility",
    "rocket-laser-targeting-subsystem",
    "hyper-combobulator",
];

const getRandom = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
};

const useRandomizedTimestamps = Boolean(process.argv.includes("--randomize-timestamps"));

const getTime = () => {
    const now = new Date().getTime();
    if (useRandomizedTimestamps) {
        return now - Math.floor(5000 * Math.random());
    } else {
        return undefined;
    }
}

const produceLogs = (obj = {}) => {
    const message = getRandom(logMessages);
    const isStructured = getRandom([true, true, true, false]);
    if (isStructured) {
        const level = getRandom(logLevels);
        const package = getRandom(packages);
        const healthy = getRandom([{ healthy: true }, { healthy: false }, {}]);
        logger[level]({ ...obj, package, ...healthy, time: getTime() }, message);
    } else {
        console.log(message);
    }
};

console.log("Starting 'guinea-pig-app'...");

logger.trace(logMessages[0]);
logger.debug(logMessages[1]);
logger.info(logMessages[2]);
logger.warn(logMessages[3]);
logger.error(logMessages[4]);
logger.fatal(logMessages[5]);

setInterval(() => produceLogs(), 1000);
