const fs = require("node:fs");
const path = require("node:path");
const { graphqlApi } = require("./graphql.api");

class GraphqlService {
  async makeLazyOrdersSnapshot() {
    const lazyOrders = [];

    const limit = 10;
    let offset = 0;
    do {
      const lazyOrdersBatch = await graphqlApi.getOrders({ limit, offset });

      lazyOrders.push(...lazyOrdersBatch);

      console.log(lazyOrders.length);

      if (lazyOrdersBatch.length < limit) {
        break;
      }

      offset += limit;
    } while (true);

    await fs.writeFileSync(
      path.resolve("./snapshots/orderItems.json"),
      JSON.stringify({ lazyOrders }, null, "  ")
    );
  }

  async makeOrderItemsSnapshot() {
    const { lazyOrders } = require(path.resolve("./snapshots/lazyOrders.json"));

    const orderItems = [];

    for (let i = 0; i < lazyOrders.length; i++) {
      const orderItem = await graphqlApi.getOrderItem(lazyOrders[i].id);

      orderItems.push(orderItem);

      console.log(i);
    }

    await fs.writeFileSync(
      path.resolve("./snapshots/orderItems.json"),
      JSON.stringify({ orderItems }, null, "  ")
    );
  }
}

exports.graphqlService = new GraphqlService();
