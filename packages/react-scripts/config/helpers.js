'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const _ = require('lodash');

const paths = require('./paths');

const requireParam = param => {
  throw new Error(`${param} was not required`);
};

const includeRuntimeChunk = chunk => [chunk, `runtime~${chunk}`];

/*  */
const createHtmlTemplate = ({
  name = requireParam('name'),
  chunkName = name,
  additionalChunks = [],
}) =>
  new HtmlWebpackPlugin({
    template: path.resolve(paths.appPublic, `${name}.html`),
    filename: `${name}.html`,
    chunks: [...additionalChunks, ...includeRuntimeChunk(chunkName), 'vendors'],
  });

const createHtmlTemplates = (templateMap = []) =>
  templateMap.map(config => {
    if (_.isObject(config)) {
      return createHtmlTemplate(config);
    }

    return createHtmlTemplate({ name: config });
  });

/* Helper function to quickly include thread loader with sane defaults */
const parallelizeLoader = (isDev = process.env.NODE_ENV === 'development') => ({
  loader: require.resolve('thread-loader'),
  options: {
    poolTimeout: isDev
      ? Infinity /* Only on dev: keep workers alive for more effective watch mode */
      : 5000,
  },
});

module.exports = {
  requireParam,
  createHtmlTemplates,
  includeRuntimeChunk,
  parallelizeLoader,
};
