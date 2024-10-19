const path = require("node:path");

const externalService = require("./modules/external");
const utils = require("./utils");

const { orderItems } = require(path.resolve("./snapshots/orderItems.json"));

exports.getProductPatternStats = () => {
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
};

exports.executeWheel = async () => {
  const wheelInfo = await externalService.getWheel();

  let { attempts } = wheelInfo.game;

  console.log({ attempts });

  while (attempts > 0) {
    await utils.sleep(1000 + Math.random() * 1000);

    const result = await externalService.postWheelTry();

    attempts = result.attemptQty;

    console.log(
      `(${result.promoId}) ${result.signText}${result.rewardValue} ${result.unitText} ${result.couponDescription}`
    );
  }
};
