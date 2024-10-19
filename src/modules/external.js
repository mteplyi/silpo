const authService = require("./auth");
const utils = require("../utils");

const defaultHeaders = /** @type {const} */ ({
  "accept-encoding": "gzip",
  appguid: "bfd8b2e3-0bdc-47c9-b375-736f032dc8e0",
  // authorization: __bearer_token__,
  host: "sf-external-api.silpo.ua",
  "user-agent": "Dart/3.5 (dart:io)",
  "user-info": `{pushNotificationTrackingCode: 1, appVersionCode: "4.5.1 (372)", brand: "Google", model: "GKWS6", sdkRelease: "Android 12 (32)"}`,
});

/**
 * @param {{
 *  method: "get" | "post"
 *  path: string
 * }} params
 */
exports.request = async ({ method, path }) => {
  const accessToken = await authService.getAccessToken();

  const headers = /** @type {const} */ ({
    ...defaultHeaders,
    authorization: `Bearer ${accessToken}`,
  });

  const res = await fetch(`https://sf-external-api.silpo.ua${path}`, {
    method,
    headers,
  });

  const resBody = await utils.parseBody(res);

  if (
    resBody?.error?.errorString &&
    ["TOKEN_EXPIRED", "TOKEN_INVALID"].includes(resBody.error.errorString)
  ) {
    console.log(`Access token error ${resBody.error.errorString}, renew...`);
    await authService.renewAccessToken();
    console.log("Access token is renewed");

    return exports.request({ method, path });
  }

  utils.checkForError({
    params: { path, method, headers },
    res,
    resBody,
  });

  return resBody;
};

/**
 * @returns {{
 *  game: {
 *    name: "Колесо Фортуни"
 *    description: "https://silpo.ua/app_bonuses_and_points.html"
 *    bB_Description: "https://static.silpo.ua/mobile/silpo/pages/vr/wheel_of_fortune.html"
 *    motivationTextOne: "Хапайте удачу за колесо!"
 *    motivationTextTwo: "Швидше обертайте - виграш чекає!"
 *    congratulationTextOne: "Круто покрутили!"
 *    congratulationTextTwo: "Наші вітання - за ваші обертання!"
 *    attemptsExhaustedTextOne: "ПОГРАЛИ - ЧАС ВІДПОЧИТИ!"
 *    attemptsExhaustedTextTwo: "Повертайтеся завтра!"
 *    attempts: 2
 *    isAvailable: true
 *    wheelView: {
 *      centerImage: "https://d3pbdyzf7elowv.cloudfront.net/mobile/silpo/images/wf/center_image.svg"
 *      wheelBorderColor: "#F3DA49"
 *      sectors: any[]
 *    }
 *  }
 *  gameMask: { maskOn: false }
 *  error: {
 *    errorCode: 0
 *    errorString: "OK"
 *    errorTrace: null
 *    httpStatusCode: 200
 *  }
 *  headers: null
 * }}
 */
exports.getWheel = async () => {
  const resBody = await exports.request({
    method: "get",
    path: "/v1/wheel",
  });

  return resBody;
};

/**
 * @returns {{
 *  promoId: 254389
 *  signText: "×"
 *  rewardValue: 5
 *  unitText: "балів"
 *  couponDescription: "за купівлю зубних щіток щоб усмішка завжди була на всі 100 :)"
 *  attemptQty: 2
 *  listImages: [
 *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/dd7e5628cb_720x720.png"
 *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/dd7e5628cb_550x500.png"
 *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/dd7e5628cb_545x440.png"
 *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/dd7e5628cb_480x480.png"
 *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/dd7e5628cb_400x400.png"
 *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/dd7e5628cb_280x246.png"
 *  ]
 *  attemptsExhaustedTextOne: "ПОГРАЛИ - ЧАС ВІДПОЧИТИ!"
 *  attemptsExhaustedTextTwo: "Повертайтеся завтра!"
 *  congratulationTextOne: "Круто покрутили!"
 *  congratulationTextTwo: "Наші вітання - за ваші обертання!"
 *  motivationTextOne: "Хапайте удачу за колесо!"
 *  motivationTextTwo: "Швидше обертайте - виграш чекає!"
 *  bB_RewardValue: 5
 *  bB_UnitText: "балобонусів"
 *  bB_CouponDescription: "за купівлю зубних щіток щоб усмішка завжди була на всі 100 :)"
 *  error: {
 *    errorCode: 0
 *    errorString: "OK"
 *    errorTrace: null
 *    httpStatusCode: 200
 *  }
 *  headers: null
 * }}
 */
exports.postWheelTry = async () => {
  const resBody = await exports.request({
    method: "post",
    path: "/v1/wheel/try",
  });

  return resBody;
};
