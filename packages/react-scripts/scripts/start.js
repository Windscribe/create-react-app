process.env.NODE_ENV = 'development';
process.env.BABEL_ENV = 'development';

const WebpackDevServer = require('webpack-dev-server');

const logger = require('consola');
const chalk = require('chalk');

const clearConsole = require('react-dev-utils/clearConsole');
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');

const remoteDevServer = require('remotedev-server');

const config = require('../config/webpack/config.dev');
const { createCompiler } = require('../config/helpers');

const prepare = require('./utils/prepare');
const openChrome = require('./utils/openChrome');

let firstCompile = true;

const compiler = createCompiler(config, [
  `webpack-dev-server/client?http://localhost:${config.devServer.port}`,
  'webpack/hot/dev-server',
  require.resolve('../config/polyfills.js'),
]);

/* Waits until webpack compile finishes */
compiler.hooks.done.tap({ name: 'Initial compile startup' }, () => {
  if (firstCompile) {
    firstCompile = false;
    if (process.env.OPEN_CHROME) {
      openChrome();
    }
  }
});

const init = async () => {
  await prepare();

  const server = new WebpackDevServer(compiler, {
    ...config.devServer,
    before(app) {
      app.use(errorOverlayMiddleware());
    },
  });

  server.listen(3000, '0.0.0.0', err => {
    if (err) {
      console.log(err);
    }

    if (process.env.ENABLE_REMOTE_REDUX) {
      remoteDevServer({ host: 'localhost', port: 3100 });
    }

    if (process.stdout.isTTY) {
      clearConsole();
    }

    logger.info(chalk.blue('Starting development server... \n'));
  });

  const sigs = ['SIGINT', 'SIGTERM'];
  sigs.forEach(function(sig) {
    process.on(sig, function() {
      server.close();
      process.exit();
    });
  });
};

init();
