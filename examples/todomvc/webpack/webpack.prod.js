var path = require('path');
var webpack = require('webpack');
var failPlugin = require('webpack-fail-plugin');

var APP_DIR = path.join(__dirname, '..', 'src');

module.exports = {
  devtool: 'source-map',
  entry: './src/index.tsx',
  module: {
    preLoaders: [{
      test: /\.tsx?$/,
      loader: 'tslint',
      include: APP_DIR
    }],
    loaders: [{
      test: /\.tsx?$/,
      loaders: ['ts'],
      include: APP_DIR
    }]
  },
  output: {
    path: path.join(__dirname, '..', 'build', 'js'),
    filename: 'app.js',
    publicPath: '/js/'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    failPlugin
  ],
  resolve: {
    root: [path.resolve('../src')],
    extensions: ['', '.tsx', '.ts', '.jsx', '.js']
  },
  tslint: {
    emitErrors: true,
    failOnHint: true
  }
}
