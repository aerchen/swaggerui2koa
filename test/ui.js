'use strict';

const fs = require('fs');
const path = require('path');
const jsyaml = require('js-yaml');
const koa = require('koa');

const app = new koa();
app.use(async (ctx, next) => {
  await next().catch(console.error.bind(null, 'errorHandler'));
});

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
const spec = fs.readFileSync(path.join(__dirname,'swagger.yaml'), 'utf8');
const swaggerDoc = jsyaml.safeLoad(spec);

const options = {
  swaggerUi: 'swagger'
};
// Serve the Swagger documents and Swagger UI
app.use(require('../index')(swaggerDoc, options));

// request handler
app.use(async (ctx, next) => {
  ctx.body = ctx.request;
});

const port = 8090;
// Start the server
app.listen(port, function () {
  console.log('Server is listening on port', port);
  console.log(`Swagger-ui is available on http://localhost:${port}/${options.swaggerUi}/`);
});


