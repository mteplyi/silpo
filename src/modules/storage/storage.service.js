const { S3Repository } = require("../s3/s3.repository");
const { FileStateStrategy } = require("./strategies/fileState.strategy");
const { S3StateStrategy } = require("./strategies/s3State.strategy");

/**
 * @typedef {import("./strategies/state.strategy").StateStrategy} StateStrategy
 * @typedef {"phone" | "phonesHistory" | "refreshToken" | "accessToken"} StorageKey
 */

class StorageService {
  /**
   * @readonly
   */
  #stateStrategy;

  /** @type {Record<any, any> | undefined} */
  #stateCache;

  /**
   * @param {StateStrategy} stateStrategy
   */
  constructor(stateStrategy) {
    this.#stateStrategy = stateStrategy;
  }

  /**
   * @param {StorageKey} key
   */
  async get(key) {
    const state = await this.#getState();

    const value = state[key];

    return structuredClone(value);
  }

  /**
   * @param {StorageKey} key
   * @param {unknown} value
   */
  async set(key, value) {
    const state = await this.#getState();

    state[key] = structuredClone(value);

    await this.#setState(state);
  }

  /**
   * @param {StorageKey} key
   */
  async unset(key) {
    const state = await this.#getState();

    delete state[key];

    await this.#setState(state);
  }

  /**
   * @param {Partial<Record<StorageKey, unknown>>} updateData
   */
  async assign(updateData) {
    const state = await this.#getState();

    Object.assign(state, structuredClone(updateData));

    await this.#setState(state);
  }

  async #getState() {
    if (this.#stateCache) {
      return this.#stateCache;
    }

    return this.#initState();
  }

  /**
   * @param {Record<any, any>} state
   */
  async #setState(state) {
    this.#stateCache = state;

    await this.#persistState(state);
  }

  async #initState() {
    const stateJson = await this.#stateStrategy.retrieve();

    /** @type {Record<any, any>} */
    let state;

    if (!stateJson) {
      state = {};
      this.#stateCache = state;

      await this.#persistState(state);
    } else {
      const parsedState = JSON.parse(stateJson);

      if (typeof parsedState !== "object" || parsedState === null) {
        throw new Error("State data type is invalid", {
          cause: { state: parsedState },
        });
      }

      state = parsedState;
      this.#stateCache = state;
    }

    return state;
  }

  /**
   * @param {Record<any, any>} state
   */
  async #persistState(state) {
    const stateJson = JSON.stringify(state, null, "  ");

    await this.#stateStrategy.save(stateJson);
  }
}

/** @type {StateStrategy} */
let stateStrategy;

switch (process.env.STATE_STRATEGY ?? "FILE") {
  case "FILE":
    stateStrategy = new FileStateStrategy();
    break;

  case "S3":
    const s3Repository = new S3Repository();
    stateStrategy = new S3StateStrategy(s3Repository);
    break;

  default:
    throw new Error("STATE_STRATEGY env is invalid", {
      cause: { STATE_STRATEGY: process.env.STATE_STRATEGY },
    });
}

exports.storageService = new StorageService(stateStrategy);
