const fs = require("node:fs/promises");

const sessionFile = ".session.json";

/** @type {string | null} */
let session = null;

const initSession = async () => {
  const fileAccessible = await fs
    .access(sessionFile, fs.constants.R_OK)
    .then(() => true)
    .catch(() => false);

  if (!fileAccessible) {
    session = {};

    await saveSession();
  } else {
    const sessionJson = await fs.readFile(sessionFile, "utf8");

    session = JSON.parse(sessionJson);
  }
};

const saveSession = async () => {
  const sessionJson = JSON.stringify(session, null, "  ");

  await fs.writeFile(sessionFile, sessionJson, "utf8");
};

/**
 * A number, or a string containing a number.
 * @typedef {"phone" | "phonesHistory" | "otp" | "refreshToken" | "accessToken"} SessionKey
 */

/**
 * @param {SessionKey} key
 */
exports.get = async (key) => {
  if (!session) {
    await initSession();
  }

  const value = session[key];

  return structuredClone(value);
};

/**
 * @param {SessionKey} key
 * @param {unknown} value
 */
exports.set = async (key, value) => {
  if (!session) {
    await initSession();
  }

  session[key] = structuredClone(value);

  await saveSession();
};

/**
 * @param {SessionKey} key
 */
exports.unset = async (key) => {
  if (!session) {
    await initSession();
  }

  delete session[key];

  await saveSession();
};

/**
 * @param {Partial<Record<SessionKey, unknown>>} updateData
 */
exports.assign = async (updateData) => {
  if (!session) {
    await initSession();
  }

  Object.assign(session, structuredClone(updateData));

  await saveSession();
};
