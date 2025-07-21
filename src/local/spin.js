require("dotenv/config");

const { businessService } = require("../modules/business.service");

(async () => {
  await businessService.executeWheels();
})();
