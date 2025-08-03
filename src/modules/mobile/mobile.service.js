const { mobileApi } = require("./mobile.api");

class MobileService {
  async getWheelInfo() {
    const data = await mobileApi.getWheelInfo();
    return data;
  }

  async spinWheel() {
    const data = await mobileApi.postWheelTry();
    return data;
  }
}

exports.mobileService = new MobileService();
