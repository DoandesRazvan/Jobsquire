const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the browser cache location to a local folder in your project
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};