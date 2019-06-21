const getUtils = require('./helpers/utils');
const config = require('./configs/loader');

const loaders = config.loaders
  .map(function(loader) {
    return Object.assign({}, loader, { loader: require(`../${loader.loader}`) });
  })
  .reduce(function(loaders, loader) {
    loaders[loader.fromext] = loader;
    return loaders;
  }, {});

module.exports = function(config, workdir) {
  const { getExtname, abssrc } = getUtils(config, workdir);
  return {
    test({pathname}) {
      const extname = getExtname(pathname);
      if (!extname) {
        return false;
      }

      return !!loaders[extname];
    },
    compile: async function({pathname, target, referer, extract, library}) {
      const extname = getExtname(pathname);
      const {type, loader} = loaders[extname];

      const res = await loader({
        filepath: abssrc(pathname),
        referer,
        target,
        extract,
        library
        //externals: asset.externals.all(referer)
      });

      return Object.assign({}, res, { type });
    }
  };
};

