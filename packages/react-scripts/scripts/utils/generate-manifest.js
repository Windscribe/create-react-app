const fs = require('fs-extra');
const path = require('path');
const logger = require('consola');
const { merge } = require('lodash');

const paths = require('../../config/paths');

const package = require(paths.appPackageJson);

const manifestDir = path.join(paths.appPublic, 'manifest');
// Manifests
const baseManifest = require(path.resolve(manifestDir, 'base.json'));
const devManifest = require(path.resolve(manifestDir, 'dev.json'));

const ENV = process.env.NODE_ENV;

// Get the keys that are arrays
const getKeys = obj =>
  Object.keys(obj).filter(keyName => Array.isArray(obj[keyName]));

const getArray = (array = []) => array;

module.exports = (buildTarget = process.env.BUILD_TARGET || 'chrome') => {
  logger.info(`Building manifest for target: ${buildTarget}`);
  // const fileSystem = require('fs')

  const buildManifest = require(path.resolve(
    manifestDir,
    `${buildTarget}.json`
  ));

  // generates the manifest file using the package.json information
  const generateManifest = async ({ env = ENV } = {}) => {
    const arrayKeys = getKeys(baseManifest);

    // Merge the array keys first
    const mergedKeys = arrayKeys.map(keyName => {
      let manifestKeys = [
        ...getArray(baseManifest[keyName]),
        ...getArray(buildManifest[keyName]),
      ];

      if (ENV === 'development') {
        manifestKeys = [...manifestKeys, ...getArray(devManifest[keyName])];
      }

      return {
        [keyName]: manifestKeys,
      };
    });

    return merge(
      baseManifest,
      ENV === 'development' ? devManifest : {},
      buildManifest,
      {
        version: package.version,
      },
      ...mergedKeys
    );
  };

  const writeManifest = (manifest, target = 'dev') =>
    new Promise(resolve => {
      // Check if the target is 'dev' then write out to build folder
      const outDir = path.join(
        target === 'dev' ? paths.appBuild : `${paths.appBuild}/${target}`
      );
      fs.ensureDirSync(outDir);

      fs
        .writeFile(
          path.join(outDir, 'manifest.json'),
          JSON.stringify(manifest, null, 2)
        )
        .then(resolve)
        .catch(err => new Error(err));
    });

  // If building prod build both ff and chrome
  if (ENV === 'production') {
    generateManifest().then(generatedManifest =>
      writeManifest(generatedManifest, buildTarget)
    );
    // for running the dev server with prod data
    generateManifest({ env: 'development' }).then(generatedManifest =>
      writeManifest(generatedManifest)
    );
  } else {
    // Write to build
    generateManifest()
      .then(generatedManifest => writeManifest(generatedManifest))
      .catch(console.log);
  }
};
