const path = require("node:path");

const { externalService } = require("./modules/external/external.service");
const { mobileService } = require("./modules/mobile/mobile.service");
const utils = require("./utils");

const { orderItems } = require(path.resolve("./snapshots/orderItems.json"));

class BusinessService {
  getProductPatternStats() {
    let products = orderItems.flatMap((orderItem) =>
      orderItem.orderLines.map((orderLine) => ({
        orderDate: new Date(orderItem.createDate).toISOString(),
        name: orderLine.name,
      }))
    );

    // const pattern = /(форел|лосос|сьомг|norven|skadi)/giu
    // const pattern = /(печінк|тріск)/giu
    const pattern = /(томат)/giu;

    products = products.filter(({ name }) => pattern.test(name));

    products = products.reverse();
    // names = names.slice(-10);

    console.log(pattern);
    console.log(
      products.map((product) => `${product.orderDate} - ${product.name}`)
    );
    console.log(products.length);
  }

  async executeOldWheel() {
    console.log("Executing old wheel...");

    const wheelGame = await externalService.getWheelInfo();

    let { attempts } = wheelGame;

    console.log({ attempts });

    while (attempts > 0) {
      await utils.sleep(500 + Math.random() * 500);

      const result = await externalService.spinWheel();

      attempts = result.attemptQty;

      console.log(
        `(${result.promoId}) ${result.signText}${result.rewardValue} ${result.unitText} ${result.bB_CouponDescription}`
      );
    }
  }

  async executeWheel() {
    console.log("Executing wheel...");

    const wheelGame = await mobileService.getWheelInfo();

    let attempts = wheelGame.attemptQty;

    console.log({ attempts });

    while (attempts > 0) {
      await utils.sleep(500 + Math.random() * 500);

      const result = await mobileService.spinWheel();

      attempts = result.attemptQty;

      console.log(
        `(${result.promoId}) ${result.signText}${result.rewardValue} ${result.unitText} ${result.couponDescription}`
      );
    }
  }

  async executeWheels() {
    await this.executeOldWheel();

    console.log();

    await this.executeWheel();
  }
}

exports.businessService = new BusinessService();
