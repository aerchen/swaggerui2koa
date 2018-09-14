# swaggerui2koa

swagger ui middleware for koa2

install
```
npm install swaggerui2koa
```

example
```
const app = new koa();

// load swagger schema
const spec = fs.readFileSync(path.join(__dirname,'swagger.yaml'), 'utf8');
const swaggerDoc = jsyaml.safeLoad(spec);

const options = {
  swaggerUi: 'swagger' // config swagger ui path
};
// Serve the Swagger documents and Swagger UI
app.use(require('../index')(swaggerDoc, options));
// vist swagger ui view on http://localhost:8080/swagger/

app.listen(8080);

```


