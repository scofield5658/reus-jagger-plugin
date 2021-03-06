const fs = require('fs');
const path = require('path');
const url = require('url');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const getWebpackConfig = require('../configs/webpack.config');
const getUtils = require('../helpers/utils');
const handleAsset = require('./asset');
const handleManifest = require('./manifest');

module.exports = function(workdir, config) {
  const webpackConfig = getWebpackConfig(config);
  const asset = handleAsset(workdir, config);
  const manifest = handleManifest(workdir, config);
  const { abs2rel, abstmp, srcUrl, cpfile, isEmptyObject, radom } = getUtils(config, workdir);
  return function({ filepath, referer, target = 'web', extract, library }) {
    return new Promise(function(resolve, reject) {
      const tmppath = abstmp(abs2rel(filepath));

      const tgtConfig = Object.assign({}, webpackConfig, {
        entry: {
          'entry': filepath
        },
        output: {
          path: path.dirname(tmppath),
          filename: path.basename(tmppath),
          libraryTarget: 'umd',
          chunkFilename: (process.env.REUS_PROJECT_ENV && process.env.REUS_PROJECT_ENV !== 'dev') ?
            '[name].[hash:12].js' : '[name].js?__temporary=true'
        },
        target,
        plugins: webpackConfig.plugins || [],
      });

      if (asset.externals.test(filepath)) {
        const library = asset.externals.decode(filepath);
        tgtConfig.entry = {'entry': library};
        tgtConfig.output.library = library;
      }

      if (library) {
        tgtConfig.output.library = library;
      }

      if (referer) {
        const externals = {};
        (manifest.pages.get(referer, 'js') || []).forEach(function(js) {
          if (asset.externals.test(js)) {
            const external = asset.externals.decode(js);
            externals[external] = external;
          }
        });

        const global = manifest.externals.get();
        for (const external in global) {
          externals[external] = global[external];
        }

        if (asset.externals.test(filepath)) {
          const library = asset.externals.decode(filepath);
          delete externals[library];
        }

        if (!isEmptyObject(externals)) {
          tgtConfig.externals = externals;
        }
      }

      let extfile = null;

      if (extract) {
        const {ext} = extract;
        const plugins = tgtConfig.plugins || (tgtConfig.plugins = []);
        extfile = tmppath.replace(/\.\w+$/, `.${radom()}.${ext}`);

        plugins.push(
          new ExtractTextPlugin(path.basename(extfile))
        );
      }

      const compiler = webpack(tgtConfig);

      compiler.run(function(err, stats) {
        try {
          if (err) {
            return reject(err);
          }

          const res = {
            content: fs.readFileSync(tmppath),
            filepath: tmppath
          };

          // extract
          {
            if (extract && fs.existsSync(extfile)) {
              res.extract = {
                content: fs.readFileSync(extfile),
                filepath: extfile
              };
            }
          }

          // chunks
          {
            const chunks = stats.compilation.chunks;
            if (chunks) {
              res.chunks = [];
              for (const chunk of chunks) {
                if (chunk.name == 'entry') {
                  continue;
                }

                for (const file of chunk.files) {
                  const pathname = url.parse(file).pathname;
                  const abspath = abstmp(srcUrl(pathname));

                  cpfile({
                    from: `${path.dirname(tmppath)}${pathname}`,
                    to: abspath
                  });

                  res.chunks.push({
                    content: fs.readFileSync(abspath),
                    filepath: abspath
                  });
                }
              }
            }
          }

          return resolve(res);
        } catch (ex) {
          reject(ex);
        }
      });
    });
  };
};
