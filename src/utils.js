const { randomInt, createHash } = require("node:crypto");
const { promisify } = require("node:util");

exports.sleep = promisify(setTimeout);

/**
 * @param {Response} res
 */
exports.parseBody = async (res) => {
  try {
    const resBody = await res.json();
    return resBody;
  } catch (err) {
    err.customCause = { res };
    throw err;
  }
};

/**
 * @param {{
 *  params: any
 *  res: Response
 *  resBody: any
 * }}
 */
exports.checkForError = ({ params, res, resBody }) => {
  /** @type {string | undefined} */
  let errorMessage;

  if (res.status !== 200) {
    errorMessage = res.statusText;
  } else if (typeof resBody.error === "string") {
    errorMessage = resBody.error;
  } else if (resBody.error?.errorCode) {
    errorMessage = resBody.error.errorString;
  } else if (resBody.errors && resBody.errors.length > 0) {
    errorMessage = "Unidentified";
  }

  if (!errorMessage) {
    return;
  }

  throw new Error(errorMessage, {
    cause: { params, res, resBody },
  });
};

/**
 * @param {string} token
 * @returns {Record<any, unknown> & {
 *  exp: number
 * }}
 */
exports.parseJwt = (token) => {
  const payloadPart = token.split(".")[1];

  const payloadJson = Buffer.from(payloadPart, "base64").toString();

  const payload = JSON.parse(payloadJson);

  return payload;
};

/**
 * @type {(min: number, max: number) => Promise<number>}
 */
const randomIntAsync = promisify(randomInt);

/**
 * @returns {Promise<string>}
 */
exports.getCodeVerifier = async () => {
  const alphabet =
    "-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz~";

  const length = 128;

  /** @type {Array<PromiseLike<string>>} */
  const charTasks = new Array(length);

  for (let i = 0; i < length; i++) {
    charTasks[i] = randomIntAsync(0, alphabet.length).then(
      (charIndex) => alphabet[charIndex]
    );
  }

  const chars = await Promise.all(charTasks);

  return chars.join("");
};

/**
 * @param {string} codeVerifier
 * @returns {string}
 */
exports.getCodeChallenge = (codeVerifier) => {
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  return codeChallenge;
};
