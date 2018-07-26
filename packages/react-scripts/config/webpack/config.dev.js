const { HotModuleReplacementPlugin } = require('webpack');
const WritePlugin = require('write-file-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const { createHtmlTemplates, includeRuntimeChunk } = require('../helpers');

const baseConfig = require('./config.base');
const paths = require('../paths');
const overrideConfig = require(paths.appConfig);

const port = process.env.PORT || 3000;

const config = {
  mode: 'development',
  ...baseConfig,
  entry: {
    ...baseConfig.entry,
    devListener: [paths.devWindowIndexJs],
    devWindow: [...baseConfig.entry.popup, paths.devWindowHelpers],
  },
  plugins: [
    ...baseConfig.plugins,
    ...createHtmlTemplates([
      {
        name: 'background',
        additionalChunks: includeRuntimeChunk('devListener'),
      },
      'popup',
      { name: 'devWindow' },
    ]),
    new HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin(),
    /* Needed in order to hot reload the web extension */
    new WritePlugin(),
  ],
  devServer: {
    port,
    contentBase: paths.appBuild,
    compress: true,
    clientLogLevel: 'none',
    overlay: false,
    quiet: true,
  },
};

const overwroteConfig = overrideConfig.webpack(config, process.env);

module.exports = {
  ...overwroteConfig,
  entry: {
    ...overwroteConfig.entry,
    devWindow: [...overwroteConfig.entry.popup, paths.devWindowHelpers],
  },
};
