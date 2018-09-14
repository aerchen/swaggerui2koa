/*
 * The MIT License (MIT)
 */

'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const serveStatic = require('koa-static');
const debug = require('debug')('swaggerui2koa');

/**
 * Middleware for serving the Swagger documents and Swagger UI.
 *
 * @param {object} [schema] [required] - The Swagger Object (Swagger 2.0)
 * @param {object} [options] [optional] - The configuration options
 * @param {string=/api-docs} [options.apiDocs] - The relative path to serve your Swagger documents from
 * @param {string=/docs} [options.swaggerUi] - The relative path to serve Swagger UI from
 * @param {string} [options.swaggerUiDir] - The filesystem path to your custom swagger-ui deployment to serve
 * @param {object} [options.staticOptions] - The static server options for koa-static
 *
 * @returns the middleware function
 */

const defaultOptions = {
  apiDocs: '/api-docs',
  swaggerUi: '/docs',
  staticOptions: {},
};

exports = module.exports = function (schema, options) {
  debug('Initializing swaggerui2koa middleware');

  // validate swagger schema
  if (_.isUndefined(schema)) {
    throw new Error('schema is required');
  } else if (!_.isObject(schema)) {
    throw new TypeError('schema must be an object');
  }
  // Swagger document endpoints cache
  const apiDocsCache = JSON.stringify(schema, null, 2);

  // merge default options
  options = _.merge(defaultOptions, options);

  const {swaggerUiDir, staticOptions} = options;
  // validate swagger ui static file dir
  const swaggerUiDirPath = swaggerUiDir ? path.resolve(swaggerUiDir) : path.join(__dirname, 'swagger-ui');
  if (!fs.existsSync(swaggerUiDirPath)) {
    throw new Error('options.swaggerUiDir path does not exist: ' + swaggerUiPath);
  } else if (!fs.statSync(swaggerUiDirPath).isDirectory()) {
    throw new Error('options.swaggerUiDir path is not a directory: ' + swaggerUiPath);
  }
  debug('Static swagger-ui from:', swaggerUiDir ? swaggerUiDirPath : 'internal');
  const staticMiddle = serveStatic(swaggerUiDirPath, staticOptions);

  let {apiDocs, swaggerUi} = options;
  // Sanitize values
  if (!apiDocs.startsWith('/')) {
    apiDocs = '/' + apiDocs;
  }
  if (apiDocs.endsWith('/')) {
    apiDocs = apiDocs.slice(0, -1);
  }
  if (!swaggerUi.startsWith('/')) {
    swaggerUi = '/' + swaggerUi;
  }
  if (swaggerUi.endsWith('/')) {
    swaggerUi = swaggerUi.slice(0, -1);
  }
  debug('API Docs path:', apiDocs);
  debug('Swagger Ui path:', swaggerUi);

  return async function (ctx, next) {
    const {method, path} = ctx;
    debug('request', method, path);

    const isApiDocsPath = path === apiDocs;
    const isSwaggerUiPath = path.startsWith(swaggerUi);

    debug('Will process:', isApiDocsPath || isSwaggerUiPath ? 'yes' : 'no');

    if (!(isApiDocsPath || isSwaggerUiPath)) {
      await next();
      return;
    }

    if (path === swaggerUi) {
      debug(`Redirect to ${swaggerUi}/`);
      ctx.redirect(swaggerUi + '/');
      return;
    }

    if (isApiDocsPath) {
      debug('Serving API Docs');
      ctx.set('Content-Type', 'application/json');
      ctx.body = apiDocsCache;
      return;
    }

    debug('Serving swagger-ui');
    ctx.set('Swagger-API-Docs-URL', apiDocs);

    if (path === swaggerUi + '/') {
      ctx.path = '/';
    } else {
      ctx.path = path.substring(swaggerUi.length);
    }

    return staticMiddle(ctx, next);
  };
};
