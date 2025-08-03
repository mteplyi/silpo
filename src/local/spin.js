require("../modules/entry/initGrace");

const { businessService } = require("../modules/business/business.service");

(async () => {
  await businessService.executeWheels();
})();
