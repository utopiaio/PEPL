const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: ['./app/index.js'],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: path.join(__dirname, 'app'),
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
};

// depending on the arguments passes we'll be adding specific
// plugins to webpack else we'll have production build even on webpack dev server
if (process.argv.indexOf('-p') > -1) {
  module.exports.devtool = '#source-map';
  module.exports.plugins = [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'app/index.html'),
      filename: 'index.html',
      inject: 'body',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ];
} else {
  module.exports.plugins = [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'app/index.html'),
      filename: 'index.html',
      inject: 'body',
    }),
  ];
}
