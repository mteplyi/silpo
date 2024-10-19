const readline = require("node:readline/promises");

const session = require("./session");

const phonePrefix = "+380";
const phoneLength = 13;

/**
 * @returns {Promise<string>}
 */
exports.getPhoneNumber = async () => {
  /** @type {string[] | undefined} */
  let history = await session.get("phonesHistory");

  history = history
    ?.filter((historyItem) => historyItem.startsWith(phonePrefix))
    .map((historyItem) => historyItem.slice(phonePrefix.length));

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
    `Enter phone number (12 digits):\n${rl.getPrompt()}${phonePrefix}`
  );

  rl.close();

  /** @type {number} */
  const parsedPhoneInput = Number(phoneInput);

  if (!parsedPhoneInput) {
    return exports.getPhoneNumber();
  }

  const phone = `${phonePrefix}${parsedPhoneInput}`;

  if (phone.length !== phoneLength) {
    return exports.getPhoneNumber();
  }

  return phone;
};

/**
 * @param {{ phone: string }}
 */
exports.appendPhonesHistory = async ({ phone }) => {
  if (!phone.startsWith(phonePrefix)) {
    throw new Error("Phone must start with prefix", {
      cause: { phone, phonePrefix },
    });
  }

  if (phone.length !== phoneLength) {
    throw new Error("Phone must have valid length", {
      cause: { phone, phoneLength },
    });
  }

  /** @type {string[]} */
  let history = (await session.get("phonesHistory")) ?? [];

  history.unshift(phone);

  history = [...new Set(history)];

  await session.set("phonesHistory", history);
};

/**
 * @returns {Promise<string>}
 */
exports.getOtp = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,

    historySize: 0,
  });

  /** @type {string} */
  const otp = await rl.question(`Enter otp (6 digits):\n${rl.getPrompt()}`);

  rl.close();

  if (!otp || otp.length !== 6) {
    return exports.getOtp();
  }

  return otp;
};
