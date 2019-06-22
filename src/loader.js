const url = require('url');
const fs = require('fs');
const getUtils = require('./helpers/utils');
const handleLoader = require('./loaders/loader');
const handleAsset = require('./loaders/asset');

module.exports = function(workdir, config) {
  const { srcUrl, srcRoute, abstmp } = getUtils(config, workdir);
  const loader = handleLoader(workdir, config);
  const asset = handleAsset(workdir, config);
  return async function(ctx, next) {
    if (process.env.REUS_PROJECT_ENV && process.env.REUS_PROJECT_ENV !== 'dev') {
      return next();
    }

    const queries = ctx.query || {};

    if (queries['__compile'] === 'false') {
      return next();
    }

    if (queries['__temporary'] === 'true') {
      const tmpname = abstmp(srcUrl(url.parse(ctx.req.url).pathname));
      ctx.body = fs.readFileSync(tmpname, 'utf-8');
      return;
    }

    const pathname = srcUrl(url.parse(ctx.req.url).pathname);

    if (!loader.test({pathname})) {
      return next();
    }

    const {__library: library = ''} = asset.link.parse(ctx.req.url);
    const referer = srcRoute(url.parse((ctx.req.headers['referer'] || '')).pathname) || '*';
    const {type, content} = await loader.compile({pathname, referer, library});

    ctx.type = type;
    ctx.body = content;
  }
};

