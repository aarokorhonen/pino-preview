export const getRelativeTimestampLabel = (ms) => {
    if (ms < 60_000) {
        return `${(ms / 1_000).toFixed(0)} second(s) ago`;
    } else {
        return `${(ms / 60_000).toFixed(0)} minute(s) ago`;
    }
};
