const { businessService } = require("../modules/business.service");
const {
  getHttpRequestParams,
  isForbiddenHttpParams,
  renderTemplate,
  jsonHeaders,
  htmlHeaders,
} = require("./functionUrl");

/**
 * @typedef {import("./functionUrl").JsonValue} JsonValue
 * @typedef {import("./functionUrl").APIGatewayProxyEventV2} APIGatewayProxyEventV2
 */

const makeStuff = async () => {
  const { oldWheelPromos, wheelPromos } = await businessService.executeWheels();

  return [...oldWheelPromos, "- - -", ...wheelPromos];

  // return [
  //   "(247786) ×5 балів за купівлю шоколадних батончиків, щоб хрум-хрум – і смакота!",
  //   "(254255) ×5 балів за купівлю будь-якої вареної ковбаски, з якої виходять ну такі смачні бутерброди!",
  //   "(247807) ×5 балів за купівлю свіжих огірочків, які так пасують до салатиків!",
  //   "- - -",
  //   "(248210) x4 балобонусів за купівлю будь-якого пергаменту, щоб випікати ароматні страви!",
  //   "(248222) x4 балобонусів за купівлю засобів для миття посуду, щоб тарілочки блищали, наче люстерко ;)",
  //   "(248198) x5 балобонусів за купівлю зубних щіток, щоб усмішка завжди була на всі 100 :)",
  // ];
};

/**
 * @param { JsonValue | APIGatewayProxyEventV2 } event
 */
exports.handler = async (event) => {
  /** @type {APIGatewayProxyEventV2['requestContext']['http'] | null} */
  let httpRequestParams = null;

  try {
    console.log({ event: JSON.stringify(event) ?? "undefined" });

    httpRequestParams = getHttpRequestParams(event);

    if (httpRequestParams && isForbiddenHttpParams(httpRequestParams)) {
      return {
        statusCode: 403,
        headers: jsonHeaders,
        body: JSON.stringify({ Message: null }),
      };
    }

    const resultLines = await makeStuff();

    if (httpRequestParams) {
      const body = renderTemplate(resultLines);

      return {
        statusCode: 200,
        headers: htmlHeaders,
        body,
      };
    }
  } catch (err) {
    console.error(err);

    if (httpRequestParams) {
      const body = renderTemplate(["Failed..."]);

      return {
        statusCode: 500,
        headers: htmlHeaders,
        body,
      };
    }
  }
};
