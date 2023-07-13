var path = require('path');
var webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: './src/index.tsx',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1
            }
          }
        ]
      }
    ]
  },
  output: {
    path: path.join(__dirname, '..', 'build', 'js'),
    filename: 'app.js',
    publicPath: '/js/'
  },
  plugins: [
    new ESLintPlugin({
      extensions: ["tsx", "ts"],
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
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
    modules: [
      path.join(__dirname, '../src'),
      'node_modules'
    ],
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  },
  optimization: {
    usedExports: true
  }
}
