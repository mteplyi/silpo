const url = require("node:url");
const querystring = require("node:querystring");
const crypto = require("node:crypto");

const session = require("./session");
const promptService = require("./prompt");
const utils = require("../utils");

const authorizationClientId = "ecom--sf--mobile--flutter-app";
const authorizationScope = "openid public-my offline_access";
const authorizationRedirectUri = "ua.silpo.android://singin-callback";

const authorizationParams = /** @type {const} */ ({
  response_type: "code",
  client_id: authorizationClientId,
  redirect_uri: authorizationRedirectUri,
  code_challenge: "hHgfXYL_d6IamypSPXfwadvLTWVaBxViMK-WY87GaOQ",
  code_challenge_method: "S256",
  scope: authorizationScope,
  state: "MjAyNC0xMC0yMFQxMzoxMzozOC4wNjM3NDY=",
  nonce: "MTcyOTQxOTIxODA2Mw==",
});

const escapedAuthorizationParams = querystring.stringify(authorizationParams);

const authorizationCallback = `https://auth.silpo.ua/connect/authorize/callback?${escapedAuthorizationParams}`;

const escapedAuthorizationCallback = querystring.escape(authorizationCallback);

const getLoginV2Headers = () => {
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
    // cookie: __auth_cookies__,
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

/**
 * @param {{ phone: string }}
 */
exports.loginByPhone = async ({ phone }) => {
  const body = /** @type {const} */ ({
    phone,
    recaptcha: null,
    delivery_method: "sms",
    phoneChannelType: 0,
  });

  const headers = getLoginV2Headers();

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
};

/**
 * @param {{ phone: string, otp: string }}
 */
exports.loginWithOTP = async ({ phone, otp }) => {
  const body = /** @type {const} */ ({
    phone,
    otp,
    phoneChannelType: 0,
  });

  const headers = getLoginV2Headers();

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
};

/**
 * @param {{ authCookies: string[] }}
 */
exports.requestAuthorize = async ({ authCookies }) => {
  const headers = /** @type {const} */ ({
    ...getAuthorizeHeaders(),
    cookie: authCookies.join(";"),
  });

  const res = await fetch(authorizationCallback, {
    method: "get",
    headers,
    redirect: "manual",
  });

  const locationHeader = res.headers.get("location");
  const redirectLocation = url.parse(locationHeader);
  const queryParams = querystring.parse(redirectLocation?.query);

  if (!queryParams?.code) {
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
};

/**
 * @param {{ path: string, method: string, body: URLSearchParams }}
 */
exports.requestToken = async ({ path, method, body }) => {
  const headers = /** @type {const} */ ({
    "accept-encoding": "gzip",
    "content-type": "application/x-www-form-urlencoded; charset=utf-8",
    host: "auth.silpo.ua",
    "user-agent": "Dart/3.5 (dart:io)",
  });

  const res = await fetch(`https://auth.silpo.ua${path}`, {
    method,
    headers,
    body,
  });

  const resBody = await utils.parseBody(res);

  utils.checkForError({
    params: { method, headers, body },
    res,
    resBody,
  });

  return resBody;
};

/**
 * @param {{ authCode: string }}
 */
exports.getNewTokenViaAuth = async ({ authCode, codeVerifier }) => {
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
  const resBody = await exports.requestToken({
    method: "post",
    path: "/connect/token",
    body,
  });

  return resBody;
};

/**
 * @param {{ refreshToken: string }}
 */
exports.getNewTokenViaRefresh = async ({ refreshToken }) => {
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
  const resBody = await exports.requestToken({
    method: "post",
    path: "/connect/token",
    body,
  });

  return resBody;
};

exports.authorize = async () => {
  /**
   * TODO: generate, save and use it
   */
  // const codeVerifier = await utils.getCodeVerifier();
  // const codeChallenge = utils.getCodeChallenge(codeVerifier);

  const codeVerifier =
    "qz8-qtOxbbio93DvmnUtGNSdQl.SvH9PBqB8m2gIZwaRdRoCdQZG6UDNL-RnLd1Bvi9FAIAWdqDHajhy4QirnBXBCnMt7nqn2-7bnyw318ET0MX0NoOS6Ad36F58h5HH";

  /** @type {string | undefined} */
  let phone = await session.get("phone");

  /** @type {string | undefined} */
  let otp;
  // await session.unset("otp");

  if (!phone) {
    phone = await promptService.getPhoneNumber();
  }

  const { authCookies } = await exports.loginWithOTP({ phone, otp });
  const { authCode } = await exports.requestAuthorize({ authCookies });

  const newTokenData = await exports.getNewTokenViaAuth({
    authCode,
    codeVerifier,
  });

  try {
    await promptService.appendPhonesHistory({ phone });
  } catch (err) {
    console.error(err);
  }

  return newTokenData;
};

/**
 * @returns {Promise<string>}
 */
exports.renewAccessToken = async () => {
  let refreshToken = await session.get("refreshToken");

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
  let newTokenData;

  if (!refreshToken) {
    console.log("Refresh token is missing, authorize...");

    newTokenData = await exports.authorize();
  } else {
    newTokenData = await exports.getNewTokenViaRefresh({ refreshToken });
  }

  if (newTokenData.token_type !== "Bearer") {
    throw new Error("Unknown token type", {
      cause: { result: newTokenData },
    });
  }

  refreshToken = newTokenData.refresh_token;
  const accessToken = newTokenData.access_token;

  if (!refreshToken) {
    throw new Error("Refresh token is empty", {
      cause: { result: newTokenData },
    });
  }
  if (!accessToken) {
    throw new Error("Access token is empty", {
      cause: { result: newTokenData },
    });
  }

  await session.assign({
    refreshToken,
    accessToken,
  });

  return accessToken;
};

/**
 * @returns {Promise<string>}
 */
exports.getAccessToken = async () => {
  let accessToken = await session.get("accessToken");

  if (!accessToken) {
    console.log("Access token is missing, renew...");
    accessToken = await exports.renewAccessToken();
    console.log("Access token is renewed");

    return accessToken;
  }

  const payload = utils.parseJwt(accessToken);

  if (payload.exp * 1000 <= Date.now()) {
    console.log("Access token is expired, renew...");
    accessToken = await exports.renewAccessToken();
    console.log("Access token is renewed");

    return accessToken;
  }

  return accessToken;
};
