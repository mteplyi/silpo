const { S3Repository } = require("../../s3/s3.repository");

/**
 * @typedef {import("./state.strategy").StateStrategy} StateStrategy
 * @implements {StateStrategy}
 */
class S3StateStrategy {
  /**
   * @readonly
   */
  #s3Key = ".state.json";

  /**
   * @readonly
   */
  #s3Repository;

  /**
   * @param {S3Repository} s3Repository
   */
  constructor(s3Repository) {
    this.#s3Repository = s3Repository;
  }

  async retrieve() {
    return this.#s3Repository.get({
      key: this.#s3Key,
    });
  }

  /**
   * @param {string} data
   */
  async save(data) {
    await this.#s3Repository.put({
      key: this.#s3Key,
      data,
    });
  }
}

exports.S3StateStrategy = S3StateStrategy;
