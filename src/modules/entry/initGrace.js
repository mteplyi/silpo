const { inspectDeep } = require("../utils/inspectDeep");

process.on("uncaughtException", (reason) => {
  console.error("uncaughtException:", inspectDeep(reason));
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", inspectDeep(reason));
});

require("./dotenv");
