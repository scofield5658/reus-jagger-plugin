const path = require('path');
const mount = require('koa-mount');
const serve = require('koa-static');

module.exports = function(workdir, config) {
  const baseUrl = (!process.env.REUS_PROJECT_ENV || process.env.REUS_PROJECT_ENV === 'dev') ? config.baseUrl : config.cdnUrl;
  const pagesUrl = path.join(workdir, (!process.env.REUS_PROJECT_ENV || process.env.REUS_PROJECT_ENV === 'dev') ? 'src' : 'dist', 'pages');
  return function(ctx, next) {
    return mount(baseUrl, serve(pagesUrl))(ctx, next);
  };
};
