/**
 * @typedef {string | number | boolean | null | [] | {}} JsonValue
 * @typedef {import("aws-lambda").APIGatewayProxyEventV2} APIGatewayProxyEventV2
 */

const secretPath = /** @type {const} */ ("spin");

const htmlHeaders = /** @type {const} */ ({
  "Content-Type": "text/html",
});
const jsonHeaders = /** @type {const} */ ({
  "Content-Type": "application/json",
});

/**
 * @param {JsonValue | APIGatewayProxyEventV2} event
 */
const getHttpRequestParams = (event) => {
  return (
    (typeof event === "object" &&
      event !== null &&
      "requestContext" in event &&
      event.requestContext.http) ||
    null
  );
};

/**
 * @param {APIGatewayProxyEventV2['requestContext']['http']} params
 */
const isForbiddenHttpParams = ({ method, path }) => {
  return method !== "GET" || path !== `/${secretPath}`;
};

/**
 * @param {string[]} textLines
 */
const renderTemplate = (textLines) => {
  const renderedText = textLines
    .map((line) => `<div>${line.replaceAll(/[<>]/giu, "")}</div>`)
    .join("");

  const bodyStyle = [
    "font-family:monospace",
    "font-size:1.125rem",
    "line-height:1.6em",
    "display:flex",
    "flex-direction:column",
    "gap:0.8em",
  ].join(";");

  return [
    '<meta name="color-scheme" content="dark">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<link rel="icon" href="data:,">',
    '<meta charset="UTF-8">',
    `<body style="${bodyStyle}">${renderedText}</body>`,
  ].join("");
};

module.exports = {
  getHttpRequestParams,
  isForbiddenHttpParams,
  renderTemplate,
  jsonHeaders,
  htmlHeaders,
};
