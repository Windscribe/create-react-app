const path = require('path');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

const paths = require('../../config/paths');

const generateManifest = require('./generate-manifest');

module.exports = async buildTarget => {
  try {
    await rimraf(paths.appBuild);
    await generateManifest(buildTarget);

    return 'done';
  } catch (e) {
    throw new Error(e);
  }
};
