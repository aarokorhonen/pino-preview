# json-log-preview

_Note: This is experimental software and has not been extensively tested in production environments!_

This is a utility web app for near-real-time previewing of structured JSON logs.
It is currently designed to consume output from applications which use the
[pino](https://github.com/pinojs/pino) library, but support for arbitrary structured
JSON log formats is planned.

_Screenshot – Log overview panel:_

![Screenshot of json-log-preview](./doc/screenshot-1.png "Screenshot of json-log-preview")

_Screenshot – Log entry details view:_

![Screenshot of json-log-preview](./doc/screenshot-2.png "Screenshot of json-log-preview")

The utility runs on Node.js, and uses websockets to stream log information to a locally running web interface.

## Installation (WIP)

Publishing this package is currently work-in-progress. In the meanwhile, you can run the following commands to install it locally:

```shell
$ git checkout https://github.com/aarokorhonen/json-log-preview
$ cd json-log-preview
$ yarn install
$ yarn workspace frontend run build
$ yarn global add file:$PWD
```

The last command adds it to your yarn global workspace, and then it should be available by just running `json-log-preview`. Alternatively if you dont want it in global PATH, you can skip the last command and run it directly with node (`node ~/path-to/json-log-preview`).

## Usage

This app consumes input from the stdin stream, so setup a pipe for the log-producing app (use `cat` or `tail -f` if your logs are in a file).

By default, the app will be served at [http://localhost:3001](http://localhost:3001). This can be modified by specifying the `PORT` environment variable.

Using the sidebar controls, you can filter the log entry view by log level, or by the `package` field of JSON objects.

As long as you remain scrolled to the bottom of the log panel, the view will auto-follow
to scroll down to new log entries as they appear.

For convenience, this app also forwards stdin to stdout, you can also see all log entries in your terminal in addition to the web interface. You can also pipe them to other utilities.

## Some planned features

-   [ ] Full documentation with usage
-   [ ] Support for arbitrary JSON log formats (field names, loglevels etc.)
-   [ ] Publish package
-   [ ] Improved JSON field discovery for setting filters
-   [ ] Support for `jq`-style syntax for filter expressions
-   [ ] Automatic test suite
-   [ ] Improved JSON viewing experience
-   [ ] Responsive design
-   [x] Binary usage support
-   [x] Full-text search as a filter
-   [x] Graceful handling of app shutdown
-   [x] Hide log entry details behind modal view by default
-   [x] Performance improvements (heavy logging will eventually result in huge DOM and slow down this experimental version of the app, so don't forget to shut it down after use!)
-   [x] Optional page auto-scroll
-   [x] Per-component health checks

Etc.
