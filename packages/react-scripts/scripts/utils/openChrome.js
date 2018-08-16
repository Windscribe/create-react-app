const path = require('path');
const { spawn } = require('child_process');

const logger = require('consola');

const paths = require('../../config/paths');

const extPath = path.resolve(paths.appBuild);
const chromeDirPath = path.resolve(paths.appPath, 'chrome_user_data');

const args = [
  `--disable-fre`,
  `--no-default-browser-check`,
  `--no-first-run`,
  `--load-extension=${extPath}`,
  `--user-data-dir=${chromeDirPath}`,
];

module.exports = () => {
  logger.info('Opening chrome');

  spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args);
};
