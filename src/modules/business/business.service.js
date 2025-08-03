const path = require("node:path");

const { externalService } = require("../external/external.service");
const { mobileService } = require("../mobile/mobile.service");

class BusinessService {
  getProductPatternStats() {
    const { orderItems } = require(path.resolve("./snapshots/orderItems.json"));

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

    // 3 err 3 ok -2 ok 0 -3
    if (-3 < attempts && attempts < 0) {
      attempts = Math.abs(attempts);
    }

    /** @type {string[]} */
    const promos = [];

    for (let i = 0; i < attempts; i++) {
      const result = await externalService.spinWheel();

      if (result.unitText === "Кількість спроб вичерпано") {
        console.log("Spin was requested but attempts actually have ran out...");
        break;
      } else if (result.error.errorCode === 10) {
        console.log("Spin was requested but timeout occurred...");
        continue;
      }

      const promo = `(${result.promoId}) ${result.signText?.trim()}${
        result.rewardValue
      } ${result.unitText?.trim()} ${result.couponDescription?.trim()}`;

      console.log(promo);
      promos.push(promo);
    }

    return promos;
  }

  async executeWheel() {
    console.log("Executing wheel...");

    const wheelGame = await mobileService.getWheelInfo();

    let attempts = wheelGame.attemptQty;

    console.log({ attempts });

    /** @type {string[]} */
    const promos = [];

    for (let i = 0; i < attempts; i++) {
      const result = await mobileService.spinWheel();

      const promo = `(${result.promoId}) ${result.signText?.trim()}${
        result.rewardValue
      } ${result.unitText?.trim()} ${result.couponDescription?.trim()}`;

      console.log(promo);
      promos.push(promo);
    }

    return promos;
  }

  async executeWheels() {
    const oldWheelPromos = await this.executeOldWheel();
    const wheelPromos = await this.executeWheel();

    return { oldWheelPromos, wheelPromos };
  }
}

exports.businessService = new BusinessService();
