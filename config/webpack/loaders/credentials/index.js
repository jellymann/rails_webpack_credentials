const path = require('path');

module.exports = {
  test: /\.js$/,
  enforce: 'pre',
  exclude: /node_modules/,
  use: [
    {
      loader: path.resolve(__dirname, 'loader.js'),
      options: {/* ... */ }
    }
  ]
}
