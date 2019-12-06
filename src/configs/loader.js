module.exports = {
  loaders: [
    {
      fromext: '.js',
      toext: '.js',
      type: 'application/x-javascript',
      loader: 'loaders/webpack'
    },
    {
      fromext: '.jsx',
      toext: '.js',
      type: 'application/x-javascript',
      loader: 'loaders/webpack'
    },
    {
      fromext: '.pcss',
      toext: '.css',
      type: 'text/css',
      loader: 'loaders/postcss'
    },
    {
      fromext: '.css',
      toext: '.css',
      type: 'text/css',
      loader: 'loaders/postcss'
    }
  ]
};
