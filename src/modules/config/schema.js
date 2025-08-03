const s = require("zod");

exports.configSchema = s
  .strictObject({
    env: s.enum(["local", "lambda"]),

    // promptEnabled: s.union([
    //   s.enum(["true", "false"]).transform((v) => v === "true"),
    //   s.boolean(),
    // ]),

    stateStrategy: s.enum(["file", "s3"]),
  })
  .readonly();
