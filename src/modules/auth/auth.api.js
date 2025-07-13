const url = require("node:url");
const querystring = require("node:querystring");

const utils = require("../../utils");

const authorizationClientId = "ecom--sf--mobile--flutter-app";
const authorizationScope = "openid public-my offline_access";
const authorizationRedirectUri = "ua.silpo.android://singin-callback";

// const codeVerifier = "qz8-qtOxbbio93DvmnUtGNSdQl.SvH9PBqB8m2gIZwaRdRoCdQZG6UDNL-RnLd1Bvi9FAIAWdqDHajhy4QirnBXBCnMt7nqn2-7bnyw318ET0MX0NoOS6Ad36F58h5HH"
// const codeChallenge = "hHgfXYL_d6IamypSPXfwadvLTWVaBxViMK-WY87GaOQ"

const codeVerifier =
  "E8Gqe8crXjXdaJA.FcQlsyOXusE4W9kjZb-XD3e7O3~xOdeCZixsuVxDu77SdB8l~geszcJrVNPyPdgvW11F~NJz8uKNptmWZj.NZ.cj_eE4.bMRviLwVDX8BZowK0Lh";
const codeChallenge = "NaxLWkvVcxH3eDJZs-4TIV_Vu_7iDHEPqPBz876-7dY";

const now = new Date();

const escapedAuthorizationParams = querystring.stringify({
  response_type: "code",
  client_id: authorizationClientId,
  redirect_uri: authorizationRedirectUri,
  code_challenge: codeChallenge,
  code_challenge_method: "S256",
  scope: authorizationScope,

  state: Buffer.from(
    now.toISOString().replace("Z", "") +
      Math.floor(Math.random() * 10 ** 3)
        .toString()
        .padStart(3, "0")
  ).toString("base64"),

  nonce: Buffer.from(now.getTime().toString()).toString("base64"),
});

const authorizationCallback = /** @type {const} */ (
  `/connect/authorize/callback?${escapedAuthorizationParams}`
);

const escapedAuthorizationCallback = querystring.escape(authorizationCallback);

const getV2LoginHeaders = () => {
  return /** @type {const} */ ({
    accept: "application/json",
    "accept-encoding": "gzip, deflate",
    "accept-language": "en-US,en;q=0.9",
    "access-control-allow-headers": "Accept, Content-Type",
    "access-control-allow-origin": "*",
    connection: "keep-alive",
    "content-type": "application/json",
    host: "auth.silpo.ua",
    origin: "https://auth.silpo.ua",
    referer: `https://auth.silpo.ua/login?ReturnUrl=${escapedAuthorizationCallback}`,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Dalvik/2.1.0 (Linux; U; Android 12; GKWS6 Build/W528JS)",
    "x-requested-with": "ua.silpo.android",
  });
};

const getAuthorizeHeaders = () => {
  return /** @type {const} */ ({
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-encoding": "gzip, deflate",
    "accept-language": "en-US,en;q=0.9",
    connection: "keep-alive",
    host: "auth.silpo.ua",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "user-agent": "Dalvik/2.1.0 (Linux; U; Android 12; GKWS6 Build/W528JS)",
    "x-requested-with": "ua.silpo.android",
  });
};

class AuthApi {
  /**
   * @param {{
   *  phone: string
   * }} params
   */
  async loginByPhone({ phone }) {
    const body = {
      phone,
      recaptcha: null,
      delivery_method: "sms",
      phoneChannelType: 0,
    };

    const headers = getV2LoginHeaders();

    const res = await fetch(
      `https://auth.silpo.ua/api/v2/Login/ByPhone?returnUrl=${escapedAuthorizationCallback}`,
      {
        method: "post",
        headers,
        body: JSON.stringify(body),
      }
    );

    /**
     * @type {{
     *  secondsTillNextOTP: 0
     *  lockedDurationSeconds: 0
     *  nextStep: "LoginWithOTP"
     *  profileId: null
     *  error: null
     * }}
     */
    const resBody = await utils.parseBody(res);

    utils.checkForError({
      params: {
        method: "post",
        headers,
        body,
      },
      res,
      resBody,
    });
  }

  /**
   * @param {{
   *  phone: string
   *  otp: string
   * }} params
   */
  async loginWithOTP({ phone, otp }) {
    const body = {
      phone,
      otp,
      phoneChannelType: 0,
    };

    const headers = getV2LoginHeaders();

    const res = await fetch(
      `https://auth.silpo.ua/api/v2/Login/LoginWithOTP?returnUrl=${escapedAuthorizationCallback}`,
      {
        method: "post",
        headers,
        body: JSON.stringify(body),
      }
    );

    /**
     * @type {{
     *  secondsTillNextOTP: 0
     *  lockedDurationSeconds: 0
     *  nextStep: "Authenticated"
     *  profileId: string
     *  error: null
     * }}
     */
    const resBody = await utils.parseBody(res);

    utils.checkForError({
      params: {
        method: "post",
        headers,
        body,
      },
      res,
      resBody,
    });

    const authCookies = res.headers
      .getSetCookie()
      .filter((cookie) =>
        ["idsrv.session", ".AspNetCore.Identity.Application"].includes(
          cookie.split("=")[0]
        )
      );

    return { authCookies };
  }

  /**
   * @param {{
   *  authCookies: string[]
   * }} params
   */
  async requestAuthorization({ authCookies }) {
    const headers = {
      ...getAuthorizeHeaders(),
      cookie: authCookies.join(";"),
    };

    const res = await fetch(`https://auth.silpo.ua${authorizationCallback}`, {
      method: "get",
      headers,
      redirect: "manual",
    });

    const locationHeader = res.headers.get("location");
    const redirectLocation = locationHeader ? url.parse(locationHeader) : null;
    const queryParams = redirectLocation?.query
      ? querystring.parse(redirectLocation.query)
      : null;

    if (!queryParams?.code || typeof queryParams.code !== "string") {
      throw new Error("Failed to parse code after getting authorized", {
        cause: {
          locationHeader,
          redirectLocation,
          queryParams,
        },
      });
    }

    /** @type {string} */
    const authCode = queryParams.code;

    return { authCode };
  }

  /**
   * @param {{
   *  authCode: string
   * }} params
   */
  async getNewTokenViaAuth({ authCode }) {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: authorizationRedirectUri,
      code_verifier: codeVerifier,
      client_id: authorizationClientId,
    });

    /**
     * @type {{
     *  id_token: string
     *  access_token: string
     *  expires_in: 3600
     *  token_type: "Bearer"
     *  refresh_token: string
     *  scope: "openid public-my offline_access"
     * }}
     */
    const resBody = await this.#requestToken({ body });

    return resBody;
  }

  /**
   * @param {{
   *  refreshToken: string
   * }} params
   */
  async getNewTokenViaRefresh({ refreshToken }) {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      scope: authorizationScope,
      client_id: authorizationClientId,
    });

    /**
     * @type {{
     *  id_token: string
     *  access_token: string
     *  expires_in: 3600
     *  token_type: "Bearer"
     *  refresh_token: string
     *  scope: "openid public-my offline_access"
     * }}
     */
    const resBody = await this.#requestToken({ body });

    return resBody;
  }

  /**
   * @param {{
   *  body: URLSearchParams
   * }} params
   */
  async #requestToken({ body }) {
    const headers = {
      "accept-encoding": "gzip",
      "content-type": "application/x-www-form-urlencoded; charset=utf-8",
      host: "auth.silpo.ua",
      "user-agent": "Dart/3.5 (dart:io)",
    };

    const res = await fetch("https://auth.silpo.ua/connect/token", {
      method: "post",
      headers,
      body,
    });

    const resBody = await utils.parseBody(res);

    utils.checkForError({
      params: {
        method: "post",
        headers,
        body,
      },
      res,
      resBody,
    });

    return resBody;
  }
}

exports.authApi = new AuthApi();
