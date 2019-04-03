const TerserPlugin = require('terser-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const paths = require('../paths');

const baseConfig = require('./config.base');
const overrideConfig = require(paths.appConfig);

const config = {
  ...baseConfig,
  mode: 'production',
  optimization: {
    minimizer: [new TerserPlugin()],
  },
  // Don't attempt to continue if there are errors
  bail: true,
  plugins: [...baseConfig.plugins, new FriendlyErrorsPlugin()],
};

module.exports = overrideConfig.webpack(config, process.env);
