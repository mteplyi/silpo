const fs = require("node:fs/promises");

/**
 * @typedef {import("./state.strategy").StateStrategy} StateStrategy
 * @implements {StateStrategy}
 */
class FileStateStrategy {
  /**
   * @readonly
   */
  #filePath = ".state.json";

  async retrieve() {
    return fs.readFile(this.#filePath, "utf8").catch(() => null);
  }

  /**
   * @param {string} data
   */
  async save(data) {
    await fs.writeFile(this.#filePath, data, "utf8");
  }
}

exports.FileStateStrategy = FileStateStrategy;
