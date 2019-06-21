module.exports = {
  build: require('./src/compile'),
  launch: [
    require('./src/cache'),
    require('./src/loader'),
    require('./src/serve'),
  ],
  render: require('./src/render'),
};
