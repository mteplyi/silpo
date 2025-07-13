const { authApi } = require("./auth.api");
const { sessionService } = require("../session.service");
const { promptService } = require("../prompt.service");
const utils = require("../../utils");

class AuthService {
  async authorize() {
    /**
     * TODO: generate, save and use it
     */
    // const codeVerifier = await utils.getCodeVerifier();
    // const codeChallenge = utils.getCodeChallenge(codeVerifier);

    /** @type {string | undefined} */
    let phone = await sessionService.get("phone");

    if (!phone) {
      phone = await promptService.getPhoneNumber();
    }

    await authApi.loginByPhone({ phone });

    // await session.unset("otp");
    /** @type {string | undefined} */
    const otp = await promptService.getOtp();

    const { authCookies } = await authApi.loginWithOTP({ phone, otp });
    const { authCode } = await authApi.requestAuthorization({ authCookies });

    const newTokenData = await authApi.getNewTokenViaAuth({ authCode });

    try {
      await promptService.appendPhonesHistory({ phone });
    } catch (err) {
      console.error(err);
    }

    return newTokenData;
  }

  /**
   * @returns {Promise<string>}
   */
  async renewAccessToken() {
    let refreshToken = await sessionService.get("refreshToken");

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

      newTokenData = await this.authorize();
    } else {
      newTokenData = await authApi.getNewTokenViaRefresh({ refreshToken });
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

    await sessionService.assign({
      refreshToken,
      accessToken,
    });

    return accessToken;
  }

  /**
   * @returns {Promise<string>}
   */
  async getAccessToken() {
    let accessToken = await sessionService.get("accessToken");

    if (!accessToken) {
      console.log("Access token is missing, renew...");
      accessToken = await this.renewAccessToken();
      console.log("Access token is renewed");

      return accessToken;
    }

    const payload = utils.parseJwt(accessToken);

    if (payload.exp * 1000 <= Date.now()) {
      console.log("Access token is expired, renew...");
      accessToken = await this.renewAccessToken();
      console.log("Access token is renewed");

      return accessToken;
    }

    return accessToken;
  }
}

exports.authService = new AuthService();
