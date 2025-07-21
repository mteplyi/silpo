const readline = require("node:readline/promises");

const { storageService } = require("./storage/storage.service");

class PromptService {
  #phonePrefix = "+380";
  #phoneLength = 13;

  /**
   * @returns {Promise<string>}
   */
  async getPhoneNumber() {
    /** @type {string[] | undefined} */
    let history = await storageService.get("phonesHistory");

    history = history
      ?.filter((historyItem) => historyItem.startsWith(this.#phonePrefix))
      .map((historyItem) => historyItem.slice(this.#phonePrefix.length));

    if (!history) {
      history = [];
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,

      historySize: history.length,
      history: history,

      completer: (line) => {
        const suggestions = history.filter(
          (historyItem) =>
            historyItem.length > line.length && historyItem.startsWith(line)
        );

        return [suggestions, line];
      },
    });

    /** @type {string} */
    const phoneInput = await rl.question(
      `Enter phone number (12 digits):\n${rl.getPrompt()}${this.#phonePrefix}`
    );

    rl.close();

    /** @type {number} */
    const parsedPhoneInput = Number(phoneInput);

    if (!parsedPhoneInput) {
      return this.getPhoneNumber();
    }

    const phone = `${this.#phonePrefix}${parsedPhoneInput}`;

    if (phone.length !== this.#phoneLength) {
      return this.getPhoneNumber();
    }

    return phone;
  }

  /**
   * @param {{
   *  phone: string
   * }} params
   */
  async appendPhonesHistory({ phone }) {
    if (!phone.startsWith(this.#phonePrefix)) {
      throw new Error("Phone must start with prefix", {
        cause: { phone, phonePrefix: this.#phonePrefix },
      });
    }

    if (phone.length !== this.#phoneLength) {
      throw new Error("Phone must have valid length", {
        cause: { phone, phoneLength: this.#phoneLength },
      });
    }

    /** @type {string[] | undefined} */
    let history = await storageService.get("phonesHistory");

    if (!history) {
      history = [];
    }

    history.unshift(phone);

    history = [...new Set(history)];

    await storageService.set("phonesHistory", history);
  }

  /**
   * @returns {Promise<string>}
   */
  async getOtp() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,

      historySize: 0,
    });

    /** @type {string} */
    const otp = await rl.question(`Enter otp (6 digits):\n${rl.getPrompt()}`);

    rl.close();

    if (!otp || otp.length !== 6) {
      return this.getOtp();
    }

    return otp;
  }
}

exports.promptService = new PromptService();
