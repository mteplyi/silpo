require("../modules/entry/initGrace");

const { authService } = require("../modules/auth/auth.service");

(async () => {
  const accessToken = await authService.getAccessToken();

  console.log({ accessToken });
})();
