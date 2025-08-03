const { externalApi } = require("./external.api");

class ExternalService {
  async getWheelInfo() {
    const data = await externalApi.getWheelInfo();
    return data.game;
  }

  async spinWheel() {
    const data = await externalApi.postWheelTry();
    return data;
  }
}

exports.externalService = new ExternalService();
