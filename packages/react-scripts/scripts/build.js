process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';

const path = require('path');
const sleep = require('shleep');
const { promisify } = require('util');

const webpack = promisify(require('webpack'));

const paths = require('../config/paths');
const { createHtmlTemplates } = require('../config/helpers');

const prepare = require('./utils/prepare');

const platforms = ['chrome', 'firefox'];

/* eslint-disable */
const runBuild = async target => {
  await prepare(target);

  const config = require('../config/webpack/config.prod');

  Object.keys(config.entry).forEach(
    entryName =>
      (config.entry[entryName] = [
        ...config.entry[entryName],
        require.resolve('../config/polyfills.js'),
      ])
  );

  await sleep(1000);

  return webpack({
    ...config,
    output: {
      ...config.output,
      path: path.resolve(paths.appBuild, target),
    },
    plugins: [
      ...config.plugins,
      /* The reason these plugins are not configured in `config.prod` is because there's some  crazy bug that prevents  */
      ...createHtmlTemplates(['background', 'popup']),
    ],
  });
};

platforms.forEach(runBuild);
