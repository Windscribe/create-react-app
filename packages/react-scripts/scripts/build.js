'use strict';
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';

const path = require('path');
const ora = require('ora');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

const paths = require('../config/paths');
const { createHtmlTemplates, createCompiler } = require('../config/helpers');

const prepare = require('./utils/prepare');

let platforms;
if (process.env.FF_ONLY) {
  platforms = ['firefox'];
} else if (process.env.CHROME_ONLY) {
  platforms = ['chrome'];
} else {
  platforms = require(paths.appPackageJson).webExtPlatforms || [
    'chrome',
    'firefox',
  ];
}

/* eslint-disable */
const compileBuild = target => () =>
  new Promise((resolve, reject) => {
    const config = require('../config/webpack/config.prod')(target);

    const compiler = createCompiler({
      ...config,
      bail: true,
      output: {
        ...config.output,
        path: path.resolve(paths.appBuild, target),
      },
      plugins: [
        ...config.plugins,
        /*
        The reason these plugins are not configured in `config.prod` is because there's some crazy bug that prevents templates from being written more than once at a time
      */
        ...createHtmlTemplates(['background', 'popup']),
      ],
    });

    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        reject(err);
        return;
      }

      resolve(stats);
    });
  });

let startBuild = target =>
  new Promise((resolve, reject) => {
    compileBuild(target)()
      .then(resolve)
      .catch(reject);
  });

(async () => {
  await rimraf(paths.appBuild);
  for (let platform of platforms) {
    let spinnyBoi = ora(`Starting build prepare for ${platform}`).start();
    try {
      await prepare(platform, spinnyBoi);
      spinnyBoi.text = `Running build for ${platform}`;
      await startBuild(platform);
      spinnyBoi.succeed(`${platform} build completed`);
    } catch (e) {
      spinnyBoi.fail(`${platform} failed to build`);

      console.log(e);
      process.exit();
    }
  }
})();
