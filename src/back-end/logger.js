const pino = require("pino");
const fs = require("fs");

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const logFileName = `./logs/${timestamp}.log`;

const streams = [
  { stream: process.stdout },
  { stream: fs.createWriteStream(logFileName) },
];

const logger = pino({ level: "info" }, pino.multistream(streams));

module.exports = logger;
