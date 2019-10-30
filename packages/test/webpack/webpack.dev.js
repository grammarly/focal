var webpack = require('webpack')
var path = require('path')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  devtool: 'eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './src/index.tsx'
  ],
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'tslint-loader',
        enforce: "pre"
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  },
  output: {
    filename: 'app.js',
    path: path.join(__dirname, '..', 'build', 'js'),
    publicPath: '/js/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    modules: [
      path.join(__dirname, '../src'),
      'node_modules'
    ],
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  },
  optimization: {
    usedExports: true
  }
};
