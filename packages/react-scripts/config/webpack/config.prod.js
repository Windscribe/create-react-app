'use strict';
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const paths = require('../paths');

const baseConfig = require('./config.base');
const overrideConfig = require(paths.appConfig);

const config = {
  ...baseConfig,
  mode: 'production',
  // Don't attempt to continue if there are errors
  bail: true,
  plugins: [
    ...baseConfig.plugins,
    new FriendlyErrorsPlugin(),
    new UglifyJsPlugin({
      uglifyOptions: {
        parse: {
          // we want uglify-js to parse ecma 8 code. However, we don't want it
          // to apply any minfication steps that turns valid ecma 5 code
          // into invalid ecma 5 code. This is why the 'compress' and 'output'
          // sections only apply transformations that are ecma 5 safe
          // https://github.com/facebook/create-react-app/pull/4234
          ecma: 8,
        },
        compress: {
          ecma: 5,
          warnings: false,
          // Disabled because of an issue with Uglify breaking seemingly valid code:
          // https://github.com/facebook/create-react-app/issues/2376
          // Pending further investigation:
          // https://github.com/mishoo/UglifyJS2/issues/2011
          comparisons: false,
        },
        mangle: {
          safari10: true,
        },
        output: {
          ecma: 5,
          comments: false,
          // Turned on because emoji and regex is not minified properly using default
          // https://github.com/facebook/create-react-app/issues/2488
          ascii_only: true,
        },
      },
      // Use multi-process parallel running to improve the build speed
      // Default number of concurrent runs: os.cpus().length - 1
      parallel: true,
      // Enable file caching
      cache: true,
      sourceMap: false,
    }),
  ],
};

module.exports = overrideConfig.webpack(config, process.env);
