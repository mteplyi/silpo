const { graphqlService } = require("./modules/graphql/graphql.service");
const { businessService } = require("./business.service");

(async () => {
  // await graphqlService.makeLazyOrdersSnapshot()
  // await graphqlService.makeOrderItemsSnapshot()

  // businessService.getPatternStats();

  await businessService.executeWheels();
})();
