const fs = require("node:fs/promises");

/**
 * A number, or a string containing a number.
 * @typedef {"phone" | "phonesHistory" | "otp" | "refreshToken" | "accessToken"} SessionKey
 */

class SessionService {
  /** @type {SessionService | undefined} */
  static #instance;

  /**
   * @readonly
   */
  static #sessionFile = ".session.json";

  /** @type {Record<any, any> | undefined} */
  #sessionCache;

  constructor() {
    if (SessionService.#instance) {
      return SessionService.#instance;
    }

    SessionService.#instance = this;
  }

  /**
   * @param {SessionKey} key
   */
  async get(key) {
    const session = await this.#getSession();

    const value = session[key];

    return structuredClone(value);
  }

  /**
   * @param {SessionKey} key
   * @param {unknown} value
   */
  async set(key, value) {
    const session = await this.#getSession();

    session[key] = structuredClone(value);

    await this.#setSession(session);
  }

  /**
   * @param {SessionKey} key
   */
  async unset(key) {
    const session = await this.#getSession();

    delete session[key];

    await this.#setSession(session);
  }

  /**
   * @param {Partial<Record<SessionKey, unknown>>} updateData
   */
  async assign(updateData) {
    const session = await this.#getSession();

    Object.assign(session, structuredClone(updateData));

    await this.#setSession(session);
  }

  async #getSession() {
    if (this.#sessionCache) {
      return this.#sessionCache;
    }

    const fileAccessible = await fs
      .access(SessionService.#sessionFile, fs.constants.R_OK)
      .then(() => true)
      .catch(() => false);

    if (!fileAccessible) {
      this.#sessionCache = {};

      await this.#setSession(this.#sessionCache);
    } else {
      const sessionJson = await fs.readFile(
        SessionService.#sessionFile,
        "utf8"
      );

      const session = JSON.parse(sessionJson);

      if (typeof session !== "object" || session === null) {
        throw new Error();
      }

      this.#sessionCache = /** @type {Record<any, any>} */ (session);
    }

    return this.#sessionCache;
  }

  /**
   * @param {Record<any, any>} session
   */
  async #setSession(session) {
    this.#sessionCache = session;

    const sessionJson = JSON.stringify(session, null, "  ");

    await fs.writeFile(SessionService.#sessionFile, sessionJson, "utf8");
  }
}

exports.sessionService = new SessionService();
