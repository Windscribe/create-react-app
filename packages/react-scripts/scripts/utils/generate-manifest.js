const fs = require('fs-extra');
const path = require('path');
const logger = require('consola');
let merge = require('deepmerge');
let compose = require('lodash/fp/compose');
let _ = require('lodash');

const paths = require('../../config/paths');

let fetchManifest = compose(
  require,
  file => path.resolve(paths.appPublic, 'manifest', `${file}.json`)
);
// Manifests
const baseManifest = fetchManifest('base');
const devManifest = fetchManifest('dev');

const ENV = process.env.NODE_ENV;

let formatArrayEntry = (arr = []) =>
  Object.entries(arr).reduce((obj, [k, v]) => {
    if (Array.isArray(v)) {
      obj[k] = _.uniq(v);
    } else {
      obj[k] = v;
    }

    return obj;
  }, {});

module.exports = (buildTarget = process.env.BUILD_TARGET || 'chrome') => {
  logger.info(`Building manifest for target: ${buildTarget}`);

  const buildManifest = fetchManifest(buildTarget);

  let generateManifest = () =>
    new Promise(resolve =>
      compose(
        resolve,
        formatArrayEntry,
        merge.all
      )(
        ENV === 'development'
          ? [baseManifest, buildManifest, devManifest]
          : [baseManifest, buildManifest]
      )
    );

  const writeManifest = (target = 'dev') => manifest =>
    new Promise(resolve => {
      // Check if the target is 'dev' then write out to build folder
      const outDir = path.join(
        target === 'dev' ? paths.appBuild : `${paths.appBuild}/${target}`
      );
      fs.ensureDirSync(outDir);

      fs.writeFile(
        path.join(outDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      )
        .then(resolve)
        .catch(err => new Error(err));
    });

  // // If building prod build both ff and chrome
  if (ENV === 'production') {
    generateManifest().then(writeManifest(buildTarget));
    // for running the dev server with prod data
    // generateManifest({ env: 'development' }).then(writeManifest());
  } else {
    // Write to build
    generateManifest()
      .then(writeManifest())
      .catch(console.log);
  }
};
