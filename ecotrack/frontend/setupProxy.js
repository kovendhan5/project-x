const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use('/favicon.ico', createProxyMiddleware({
    target: '/favicon.ico',
    changeOrigin: true,
    pathRewrite: {
      '^/favicon.ico': '/favicon.ico'
    }
  }));
};