/**
 * Created on 11-Jun-17.
 */
'use strict';
// common server for both production and development
import historyApiFallback from 'connect-history-api-fallback';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import express from 'express';
import http from 'http';
import httpProxy from 'http-proxy';
import logger from 'morgan';

import { chalkSuccess } from './chalkConfig';
import config from '../webpack.config.dev';

const environment = process.argv[2];
const app = express();
const server = http.createServer(app);

/* eslint-disable no-console */
console.log(chalkSuccess(`Starting Express server in ${environment} mode...`));

app.use(logger('dev'));
// delegate API request via proxy
const apiProxy = httpProxy.createProxyServer({
  target: 'http://localhost:3001'
});
app.use('/api', (req, res) =>
  apiProxy.web(req, res)
);

if (environment !== 'production') {
  // add a .env file in root of the project
  // require('dotenv').load({path: path.resolve(process.cwd() ,".env")});

  const bundler = webpack(config);

  app.use(express.static('src/*.html'));
  app.use(historyApiFallback());
  app.use(webpackHotMiddleware(bundler));
  app.use(webpackDevMiddleware(bundler, {
    // Dev middleware can't access config, so we provide publicPath
    publicPath: config.output.publicPath,

    // These settings suppress noisy webpack output so only errors are displayed to the console.
    noInfo: false,
    quiet: false,
    stats: {
      assets: false,
      colors: true,
      version: false,
      hash: false,
      timings: false,
      chunks: false,
      chunkModules: false
    }

  }));
} else {
  app.use(express.static('dist'));
}

// express


server.listen(process.env.PORT || 3000);
/* eslint-disable no-console */
console.log(chalkSuccess('Express server is listening on port: ' + server.address().port));
