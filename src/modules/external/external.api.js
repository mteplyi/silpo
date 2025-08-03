const { authService } = require("../auth/auth.service");
const utils = require("../utils/general");

const defaultHeaders = /** @type {const} */ ({
  "accept-encoding": "gzip",
  appguid: "bfd8b2e3-0bdc-47c9-b375-736f032dc8e0",
  // authorization: __bearer_token__,
  host: "sf-external-api.silpo.ua",
  "user-agent": "Dart/3.5 (dart:io)",
  "user-info": `{pushNotificationTrackingCode: 1, appVersionCode: "4.19.2 (385)", brand: "Google", model: "GKWS6", sdkRelease: "Android 11 (31)"}`,
});

class ExternalApi {
  /**
   * @param {{
   *  method: "get" | "post"
   *  path: string
   * }} params
   */
  async request({ method, path }) {
    const accessToken = await authService.getAccessToken();

    const headers = {
      ...defaultHeaders,
      authorization: `Bearer ${accessToken}`,
    };

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

      return this.request({ method, path });
    }

    utils.checkForError({
      params: { path, method, headers },
      res,
      resBody,
    });

    return resBody;
  }

  async getWheelInfo() {
    /**
     * @type {{
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
     *    attempts: number
     *    isAvailable: true
     *    wheelView: {
     *      centerImage: "https://d3pbdyzf7elowv.cloudfront.net/mobile/silpo/images/wf/center_image.svg"
     *      wheelBorderColor: "#F3DA49"
     *      sectors: any[]
     *    }
     *  }
     *  gameMask: { maskOn: false }
     *  error: {
     *    errorCode: number
     *    errorString: "OK"
     *    errorTrace: null
     *    httpStatusCode: 200
     *  }
     *  headers: null
     * }}
     */
    const resBody = await this.request({
      method: "get",
      path: "/v1/wheel",
    });

    return resBody;
  }

  async postWheelTry() {
    /**
     * @type {{
     *  promoId: number
     *  signText: "×" | null
     *  rewardValue: 5 | null
     *  unitText: "балів" | "Кількість спроб вичерпано" | null
     *  couponDescription: "за купівлю зубних щіток щоб усмішка завжди була на всі 100 :)" | null
     *  attemptQty: number
     *  listImages: [
     *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/dd7e5628cb_720x720.png",
     *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/dd7e5628cb_550x500.png",
     *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/dd7e5628cb_545x440.png",
     *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/dd7e5628cb_480x480.png",
     *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/dd7e5628cb_400x400.png",
     *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/dd7e5628cb_280x246.png",
     *  ] | null
     *  attemptsExhaustedTextOne: "ПОГРАЛИ - ЧАС ВІДПОЧИТИ!" | null
     *  attemptsExhaustedTextTwo: "Повертайтеся завтра!" | null
     *  congratulationTextOne: "Круто покрутили!" | null
     *  congratulationTextTwo: "Наші вітання - за ваші обертання!" | null
     *  motivationTextOne: "Хапайте удачу за колесо!" | null
     *  motivationTextTwo: "Швидше обертайте - виграш чекає!" | null
     *  bB_RewardValue: 5 | null
     *  bB_UnitText: "балобонусів" | ""
     *  bB_CouponDescription: "за купівлю зубних щіток щоб усмішка завжди була на всі 100 :)" | null
     *  error: {
     *    errorCode: number
     *    errorString: string
     *    errorTrace: null
     *    httpStatusCode: 200
     *  }
     *  headers: null
     * }}
     */
    let resBody;

    try {
      resBody = await this.request({
        method: "post",
        path: "/v1/wheel/try",
      });
    } catch (err) {
      /**
       * Sometimes timeout occurs. In such case the wheel usually is spined but with a noticeable delay.
       */
      if (err.cause?.resBody?.error?.errorCode === 10) {
        ({ resBody } = err.cause);
      } else {
        throw err;
      }
    }

    return resBody;
  }
}

exports.externalApi = new ExternalApi();
