const { authService } = require("../auth/auth.service");
const utils = require("../utils/general");

const defaultHeaders = /** @type {const} */ ({
  "accept-encoding": "gzip",
  appguid: "761f3b1d-a21b-40b1-8d06-0f06a0f1ecb6",
  // authorization: __bearer_token__,
  host: "sf-mobile-api.silpo.ua",
  "user-agent": "Dart/3.5 (dart:io)",
  "user-info": `{pushNotificationTrackingCode: 1, appVersionCode: "5.1.2 (460)", brand: "Google", model: "GKWS6", sdkRelease: "Android 13 (33)"}`,
});

class MobileApi {
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

    const res = await fetch(`https://sf-mobile-api.silpo.ua${path}`, {
      method,
      headers,
    });

    const resBody = await utils.parseBody(res);

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
     *  "wheelView": {
     *    "centerImage": "https://d3pbdyzf7elowv.cloudfront.net/mobile/silpo/images/wf/center_image.svg"
     *    "wheelBorderColor": "#F3DA49"
     *    "sectors": [
     *      {
     *        "id": 1
     *        "name": "КЛАС!"
     *        "color": "#9CC747"
     *        "image": "https://d3pbdyzf7elowv.cloudfront.net/mobile/silpo/images/wf/image1.svg"
     *      },
     *      {
     *        "id": 2
     *        "name": "ВА-А-У!"
     *        "color": "#ED7B30"
     *        "image": "https://d3pbdyzf7elowv.cloudfront.net/mobile/silpo/images/wf/image2.svg"
     *      },
     *      {
     *        "id": 3
     *        "name": "СУПЕР!"
     *        "color": "#50B1F9"
     *        "image": "https://d3pbdyzf7elowv.cloudfront.net/mobile/silpo/images/wf/image3.svg"
     *      },
     *      {
     *        "id": 4
     *        "name": "КЛАС!"
     *        "color": "#EA48F7"
     *        "image": "https://d3pbdyzf7elowv.cloudfront.net/mobile/silpo/images/wf/image4.svg"
     *      },
     *      {
     *        "id": 5
     *        "name": "ВА-А-У!"
     *        "color": "#F5C142"
     *        "image": "https://d3pbdyzf7elowv.cloudfront.net/mobile/silpo/images/wf/image5.svg"
     *      },
     *      {
     *        "id": 6
     *        "name": "СУПЕР!"
     *        "color": "#00C484"
     *        "image": "https://d3pbdyzf7elowv.cloudfront.net/mobile/silpo/images/wf/image6.svg"
     *      },
     *      {
     *        "id": 7
     *        "name": "ОГО-ГО!"
     *        "color": "#EA3566"
     *        "image": "https://d3pbdyzf7elowv.cloudfront.net/mobile/silpo/images/wf/image7.svg"
     *      },
     *      {
     *        "id": 8
     *        "name": "СУПЕР!"
     *        "color": "#0074F7"
     *        "image": "https://d3pbdyzf7elowv.cloudfront.net/mobile/silpo/images/wf/image8.svg"
     *      }
     *    ]
     *  }
     *  "attemptQty": number
     *  "game"?: {
     *    "gameName": "Колесо Фортуни"
     *    "tuneId": 1
     *    "urlDesc": "https://content.silpo.ua/KF_description.html"
     *    "textMF": "Хапайте удачу за колесо!"
     *    "textMS": "Швидше обертайте - виграш чекає!"
     *    "textCF": "Круто покрутили!"
     *    "textCS": "Наші вітання - за ваші обертання!"
     *    "textALF": "ПОГРАЛИ - ЧАС ВІДПОЧИТИ!"
     *    "textALS": "Повертайтеся завтра!"
     *    "periodId": 1
     *    "periodName": "День"
     *    "attemptQtyTune": number
     *    "pricePaidAttempts": 0
     *    "modified": "2025-07-11T21:25:25.8888694+00:00"
     *  }
     * }}
     */
    const resBody = await this.request({
      method: "get",
      path: "/v1/loyalty/my/fortuna",
    });

    return resBody;
  }

  async postWheelTry() {
    /**
     * @type {{
     *  "promoId": 254220
     *  "signText": "x"
     *  "rewardValue": 4
     *  "unitText": "балобонусів"
     *  "couponDescription": "за купівлю майонезу – короля всіх салатів!"
     *  "listImages": [
     *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/b668d92418_280x246.png",
     *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/b668d92418_400x400.png",
     *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/b668d92418_480x480.png",
     *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/b668d92418_545x440.png",
     *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/b668d92418_550x500.png",
     *    "https://content.silpo.ua/promo/Wheel_of_Fortune/2024/b668d92418_720x720.png",
     *  ],
     *  "attemptQty": number
     *  "pricePaidAttempts": 0
     *  "textMF": "Хапайте удачу за колесо!"
     *  "textMS": "Швидше обертайте - виграш чекає!"
     *  "textCF": "Круто покрутили!"
     *  "textCS": "Наші вітання - за ваші обертання!"
     *  "textALF": "ПОГРАЛИ - ЧАС ВІДПОЧИТИ!"
     *  "textALS": "Повертайтеся завтра!"
     * }}
     */
    const resBody = await this.request({
      method: "post",
      path: "/v1/loyalty/my/fortuna/wheel",
    });

    return resBody;
  }
}

exports.mobileApi = new MobileApi();
