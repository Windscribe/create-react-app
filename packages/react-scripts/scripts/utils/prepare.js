const path = require('path');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

const paths = require('../../config/paths');

const generateManifest = require('./generate-manifest');

const { preparationMethods } = require(paths.appConfig);
module.exports = async (buildTarget = 'dev') => {
  try {
    if (buildTarget === 'dev') {
      await rimraf(paths.appBuild);
    } else {
      await rimraf(`${paths.appBuild}/${buildTarget}`);
    }
    await generateManifest(buildTarget);

    if (preparationMethods.length > 0) {
      for (let fn of preparationMethods) {
        await fn(buildTarget);
      }
    }

    return 'done';
  } catch (e) {
    throw new Error(e);
  }
};