const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

app.use('/', (req, res, next) => {
  const target = req.query.url;
  if (!target) return res.send('Missing ?url= parameter');
  return createProxyMiddleware({ target, changeOrigin: true, pathRewrite: { '^/': '' } })(req, res, next);
});

app.listen(PORT, () => {
  console.log(`Proxy running at http://localhost:${PORT}/?url=https://example.com`);
});
