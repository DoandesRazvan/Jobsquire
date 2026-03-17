exports.handler = async (event, context) => {
    const { handler } = await import("./app.mjs");
    return handler(event, context);
};