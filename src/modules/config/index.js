require("../entry/dotenv");

const { configSchema } = require("./schema");

const rawConfig = {
  env: process.env.ENV,
  stateStrategy: process.env.STATE_STRATEGY,
};

const configParsing = configSchema.safeParse(rawConfig, {
  reportInput: true,
});

if (!configParsing.success) {
  let { error } = configParsing;

  throw new Error("Config validation failed", {
    cause: error.issues,
  });
}

const config = configParsing.data;

console.log(config);

exports.config = config;
