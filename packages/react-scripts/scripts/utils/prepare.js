const path = require('path');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

const paths = require('../../config/paths');

const generateManifest = require('./generate-manifest');

const { preparationMethods } = require(paths.appConfig);
module.exports = async (buildTarget = 'dev') => {
  try {
    await rimraf(paths.appBuild);
    await generateManifest(buildTarget);

    if (preparationMethods !== []) {
      for (let fn of preparationMethods) {
        await fn(buildTarget);
      }
    }

    return 'done';
  } catch (e) {
    throw new Error(e);
  }
};
