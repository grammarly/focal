var path = require('path');
var webpack = require('webpack');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

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
    extensions: ['', '.tsx', '.ts', '.jsx', '.js']
  },
  tslint: {
    emitErrors: true,
    failOnHint: true
  }
}
