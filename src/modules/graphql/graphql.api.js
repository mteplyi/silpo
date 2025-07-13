const fs = require("node:fs");
const path = require("node:path");

const utils = require("../../utils");

const { lazyOrders } = require(path.resolve("./snapshots/lazyOrders.json"));

const token = "NWNhM2UzZWRjNDllMjA2MjU0NDQzNTA2Y2I2M2U2M2Q";

const defaultHeaders = /** @type {const} */ ({
  "accept-language": "en-US,en;q=0.9,uk-UA;q=0.8,uk;q=0.7,ru-UA;q=0.6,ru;q=0.5",
  accept: "*/*",
  // "access-token": __access_token__,
  "content-type": "application/json",
  priority: "u=1, i",
  referer: "https://id.silpo.ua/",
  "referrer-policy": "strict-origin-when-cross-origin",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": `"macOS"`,
  "sec-ch-ua": `"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"`,
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
});

class GraphqlApi {
  async request(reqBody) {
    const headers = {
      ...defaultHeaders,
      "access-token": token,
    };

    const res = await fetch("https://graphql.silpo.ua/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify(reqBody),
    });

    const resBody = await utils.parseBody(res);

    return resBody;
  }

  async getOrders({ limit = 10, offset = 0 }) {
    const reqBody = {
      operationName: "historyByTypeLazy",
      variables: { limit, offset, type: "ecom" },
      query:
        "query historyByTypeLazy($type: History!, $limit: Int!, $offset: Int!) {\n" +
        "  historyByTypeLazy(type: $type, limit: $limit, offset: $offset) {\n" +
        "    ...SiteOrderFragmentLazy\n" +
        "    ...EcomOrderFragment\n" +
        "    __typename\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "fragment EcomOrderFragment on EcomOrder {\n" +
        "  id\n" +
        "  orderNumber\n" +
        "  barCode: orderBarcode\n" +
        "  owner\n" +
        "  displayStateText\n" +
        "  displayStateId\n" +
        "  filialId\n" +
        "  filialName\n" +
        "  barCodeImg\n" +
        "  state\n" +
        "  statusId: stateId\n" +
        "  statusName: stateText\n" +
        "  type\n" +
        "  typeId\n" +
        "  orderTypeText\n" +
        "  createDate: created\n" +
        "  deliveryType\n" +
        "  deliveryTypeText\n" +
        "  deliveryAddress\n" +
        "  deliveryLongitude\n" +
        "  deliveryLatitude\n" +
        "  orderSum: sumOut\n" +
        "  deliveryDateFrom\n" +
        "  deliveryDateTo\n" +
        "  paymentState\n" +
        "  paymentStateText\n" +
        "  note\n" +
        "  paymentSumLimit: paymentOnlineSumLimit\n" +
        "  allowPaymentOnline\n" +
        "  allowChangeDeliveryTime\n" +
        "  allowCancel\n" +
        "  paymentType\n" +
        "  paymentTypeText\n" +
        "  actions\n" +
        "  form_url: pdf_download_link\n" +
        "  __typename\n" +
        "}\n" +
        "\n" +
        "fragment SiteOrderFragmentLazy on SiteOrderLazy {\n" +
        "  id\n" +
        "  createdAt\n" +
        "  expiresAt\n" +
        "  totalPrice\n" +
        "  orderItems {\n" +
        "    product {\n" +
        "      ... on Charity {\n" +
        "        title: name\n" +
        "        __typename\n" +
        "      }\n" +
        "      ... on Ticket {\n" +
        "        event {\n" +
        "          title\n" +
        "          __typename\n" +
        "        }\n" +
        "        __typename\n" +
        "      }\n" +
        "      __typename\n" +
        "    }\n" +
        "    __typename\n" +
        "  }\n" +
        "  __typename\n" +
        "}",
    };

    const resBody = await this.request(reqBody);

    return resBody.data.historyByTypeLazy;
  }

  async getOrderItem(orderId) {
    const reqBody = {
      operationName: "getEcomOrderItem",
      variables: { orderId },
      query:
        "query getEcomOrderItem($orderId: String!) {\n" +
        "  getEcomOrderItem(orderId: $orderId) {\n" +
        "    id\n" +
        "    orderNumber\n" +
        "    barCode: orderBarcode\n" +
        "    owner\n" +
        "    filialId\n" +
        "    filialName\n" +
        "    state\n" +
        "    statusId: stateId\n" +
        "    statusName: stateText\n" +
        "    type\n" +
        "    typeId\n" +
        "    orderTypeText\n" +
        "    createDate: created\n" +
        "    deliveryType\n" +
        "    deliveryTypeText\n" +
        "    displayStateText\n" +
        "    displayStateId\n" +
        "    deliveryAddress\n" +
        "    deliveryLongitude\n" +
        "    deliveryLatitude\n" +
        "    orderSum: sumOut\n" +
        "    deliveryDateFrom\n" +
        "    deliveryDateTo\n" +
        "    paymentState\n" +
        "    paymentStateText\n" +
        "    note\n" +
        "    paymentSumLimit: paymentOnlineSumLimit\n" +
        "    allowPaymentOnline\n" +
        "    allowChangeDeliveryTime\n" +
        "    allowCancel\n" +
        "    paymentType\n" +
        "    paymentTypeText\n" +
        "    orderLines {\n" +
        "      orderId\n" +
        "      name\n" +
        "      unit\n" +
        "      lineState\n" +
        "      hint\n" +
        "      actualCount\n" +
        "      actualSum\n" +
        "      orderCount\n" +
        "      orderSum\n" +
        "      price\n" +
        "      number\n" +
        "      lineStateId\n" +
        "      imageUrls\n" +
        "      __typename\n" +
        "    }\n" +
        "    actions\n" +
        "    orderStatuses {\n" +
        "      displayStatusId\n" +
        "      displayStatusText\n" +
        "      current\n" +
        "      __typename\n" +
        "    }\n" +
        "    courierInfo {\n" +
        "      courierId\n" +
        "      courierName\n" +
        "      courierRank\n" +
        "      courierPhoto\n" +
        "      courierPhone\n" +
        "      feedbacks {\n" +
        "        rowId\n" +
        "        orderNumber\n" +
        "        name\n" +
        "        rank\n" +
        "        __typename\n" +
        "      }\n" +
        "      __typename\n" +
        "    }\n" +
        "    __typename\n" +
        "  }\n" +
        "}",
    };

    const resBody = await this.request(reqBody);

    return resBody.data.getEcomOrderItem;
  }
}

exports.graphqlApi = new GraphqlApi();
