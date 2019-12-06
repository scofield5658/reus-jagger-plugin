const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function(config) {
  return {
    module: {
      loaders: [
        {
          test: /(\.jsx|\.js)$/i,
          loader: 'babel-loader',
          exclude: /node_modules/i,
        },
        {
          test: /\.vue$/i,
          loader: 'vue-loader',
          exclude: /node_modules/i,
          options: {
            extractCSS: (process.env.REUS_PROJECT_ENV && process.env.REUS_PROJECT_ENV !== 'dev')
          }
        },
        {
          test: /\.pcss$/i,
          use : ExtractTextPlugin.extract([
            'css-loader',
            {
                loader : 'postcss-loader',
                options : {
                  plugins: [
                    require('precss'),
                    require('autoprefixer'),
                  ]
                }
            },
          ]),
        },
        {
          test: config.assets,
          loader: 'url-loader'
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: `"${process.env.REUS_PROJECT_ENV}"`,
          BASE_URL: `"${config.baseUrl}"`,
          CDN_URL: `"${config.cdnUrl}"`,
          TARGET: '"client"'
        }
      }),
      new ExtractTextPlugin("styles.css"),
    ],
    devtool: 'inline-source-map'
  };
};
