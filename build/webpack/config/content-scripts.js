require('dotenv').config();

const webpack = require('webpack');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const AssetReplacePlugin = require('../../plugins/AssetReplacePlugin');
const { version } = require('../../../_raw/manifest.json');
const paths = require('../../paths');

const contentScriptConfig = {
  watchOptions: {
    ignored: ['background/**', 'ui/**', '**/node_modules'],
  },
  entry: {
    'content-script': paths.rootResolve('src/content-script/index.ts'),
    pageProvider: paths.rootResolve('src/content-script/pageProvider/index.ts'),
  },
  output: {
    path: paths.dist,
    filename: '[name].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$|\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules|__tests__/,
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      extensions: ['ts', 'tsx', 'js', 'jsx'],
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
      dayjs: 'dayjs',
    }),
    new AssetReplacePlugin({
      '#PAGEPROVIDER#': 'pageProvider',
    }),
    new webpack.DefinePlugin({
      'process.env.version': JSON.stringify(
        `version: ${version}`
      ),
    }),
  ],
  resolve: {
    alias: {
      moment: require.resolve('dayjs'),
    },
    plugins: [new TSConfigPathsPlugin()],
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('http-browserify'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      assert: require.resolve('assert/'),
    },
    extensions: ['.js', 'jsx', '.ts', '.tsx'],
  },
  stats: 'minimal',
  optimization: {},
};

module.exports = contentScriptConfig;
