const { inspect } = require("node:util");

/**
 * @param {unknown} obj
 */
exports.inspectDeep = (obj) => {
  return inspect(obj, {
    depth: null,
    colors: process.env.ENV === "local",
  });
};
