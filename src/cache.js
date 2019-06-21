const url = require('url');
const fs = require('fs');
const getUtils = require('./helpers/utils');
const handleAsset = require('./loaders/asset');
const expires = new Date('2099-12-31T23:59:59');

module.exports = function(workdir, config) {
  const {calcMD5, srcUrl, abssrc, getExtname} = getUtils(config, workdir);
  const asset = handleAsset(workdir, config);
  return function(ctx, next) {
    if (process.env.REUS_PROJECT_ENV && process.env.REUS_PROJECT_ENV !== 'dev') {
      const extname = getExtname(url.parse(ctx.req.url).pathname);
      if (extname) {
        ctx.set('Cache-Control', `max-age=${Math.floor((+expires - config.timestamp) / 1000)}, public`);
        ctx.set('Expires', expires.toUTCString());
      }
      return next();
    }

    const queries = ctx.query || {};

    if (queries['__cache'] !== 'true') {
      return next();
    }

    const pathname = srcUrl(url.parse(ctx.req.url).pathname);
    const ifNoneMatch = ctx.get('If-None-Match');

    //npm
    if (asset.externals.test(pathname)) {
      const etag = config.timestamp;
      if (ifNoneMatch != etag) {
        ctx.set('etag', etag);
        return next();
      } else {
        return ctx.status = 304;
      }
    }

    const filepath = abssrc(pathname);
    if (!fs.existsSync(filepath)) {
      return next();
    }

    const md5 = calcMD5(fs.readFileSync(filepath));
    const etag = `${config.timestamp}-${md5}`;
    if (ifNoneMatch != etag) {
      ctx.set('etag', etag);
      return next();
    }

    ctx.status = 304;
  }
};
