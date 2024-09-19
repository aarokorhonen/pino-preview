# Pino Preview 🌲

_Interactive Web Viewer for Structured Logs_

This is a utility web app for near-real-time previewing of structured JSON logs.
It is designed to consume output from applications which use the
[pino](https://github.com/pinojs/pino) library format for logs.

The utility runs on Node.js, and uses websockets to stream log information to a locally running web interface.

## Disclaimer

_Note: This is experimental software which may change at any time under development, and should not be relied on for critical use cases._

_Note: For security reasons, never run this software against untrusted or potentially malicious input._

## Installation

Publishing this package in the npmjs.com registry is currently work-in-progress. In the meanwhile, you can install the package directly from GitHub.

### Using NPM

```shell
npm install --global "git://github.com/aarokorhonen/pino-preview#release/latest-experimental"
```

### Using Yarn

```shell
yarn global add "git://github.com/aarokorhonen/pino-preview#release/latest-experimental"
```

## Usage

This app provides a CLI command called `json-log-preview` which consumes input from the stdin stream. To use it, setup a pipe for the log-producing app (use `cat` or `tail -f` if your logs are in a file). For example:

```shell
./run-your-app.sh | json-log-preview
```

By default, the app will be served at [http://localhost:3001](http://localhost:3001). This can be modified by specifying the `PORT` environment variable. Use the `--open` flag to automatically open the web app in your default browser.

Using the sidebar controls, you can filter the log entry view by free text search, log level, timestamp, or by the `package` field of JSON objects.

As long as you remain scrolled to the bottom of the log panel, the view will auto-follow
to scroll down to new log entries as they appear.

For convenience, this app also forwards stdin to stdout, you can also see all log entries in your terminal in addition to the web interface. You can also pipe them to other utilities (such as [pino-pretty](https://github.com/pinojs/pino-pretty)). For example, a complete usage might be:

```shell
./run-your-app.sh | json-log-preview --open | pino-pretty
```
