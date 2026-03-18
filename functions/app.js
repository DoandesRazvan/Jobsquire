const serverless = require("serverless-http");

let handler;

module.exports.handler = async (event, context) => {
  if (!handler) {
    const { default: app } = await import("./server.mjs");
    handler = serverless(app);
  }
  return handler(event, context);
};