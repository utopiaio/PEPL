const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = {
  entry: ['./app/index.js'],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      // jsx and js
      {
        test: /\.jsx?$/,
        include: path.join(__dirname, 'app'),
        exclude: /node_modules/,
        loader: 'babel-loader',
      },

      // css
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },

      // less
      {
        test: /\.less$/,
        loader: 'style-loader!css-loader!postcss-loader!less-loader',
      },

      // image
      {
        test: /\.(jpg|png|gif)$/,
        loader: 'file-loader?name=static/[name].[ext]',
      },

      // fonts
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader?name=static/[name].[ext]',
      },
    ],
  },
  postcss: [autoprefixer({ browsers: ['> 0%'] })],
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
