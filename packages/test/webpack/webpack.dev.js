var webpack = require('webpack');
var path = require('path');
var failPlugin = require('webpack-fail-plugin');

module.exports = {
  debug: true,
  devtool: 'eval-source-map',
  devtoolModuleFilenameTemplate: '[absolute-resource-path]',
  devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
  entry: [
    'webpack-hot-middleware/client',
    './src/index.tsx'
  ],
  module: {
    preLoaders: [{
      test: /\.tsx?$/,
      loader: 'tslint'
    }],
    loaders: [{
      test: /\.tsx?$/,
      loaders: ['ts']
    }]
  },
  output: {
    filename: 'app.js',
    path: path.join(__dirname, '..', 'build', 'js'),
    publicPath: '/js/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    failPlugin
  ],
  resolve: {
    extensions: ['', '.tsx', '.ts', '.jsx', '.js']
  }
};
