// this simple app can be used to produce varied structured logs for consumption

const pino = require("pino");

const logger = pino({ base: null }).child({
    module: "guinea-pig-app",
    hostname: undefined,
});
logger.level = "trace";

let i = 0;
const produceLogs = (obj = {}) => {
    if (i++ === 10) console.log("This is the 10th log entry.");
    logger.info({ ...obj, function: "produceLogs" }, "Hello world!");
};

console.log("Starting 'guinea-pig-app'...");

logger.trace("[Object object]");
logger.debug("A helpful diagnostics message");
logger.info("Hello world");
logger.warn("Proceed with caution");
logger.error("Undefined is not a function");
logger.fatal("Catastrophic failure");

setInterval(() => produceLogs(), 200);
setInterval(() => produceLogs({ package: "guinea-pig-app-package-1" }), 300);
