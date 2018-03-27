var path = require('path');
var webpack = require('webpack');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

var APP_DIR = path.join(__dirname, '..', 'src');

module.exports = {
  devtool: 'source-map',
  entry: './src/index.tsx',
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
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      defaultSizes: 'parsed',
      generateStatsFile: true
    })
  ],
  resolve: {
    root: [path.resolve('../src'), path.join(APP_DIR, '..', 'node_modules')],
    alias: {
      '@grammarly/focal': path.join(APP_DIR, '..', '..', '..', 'dist', 'src')
    },
    extensions: ['', '.tsx', '.ts', '.jsx', '.js']
  },
  tslint: {
    emitErrors: true,
    failOnHint: true
  }
}
