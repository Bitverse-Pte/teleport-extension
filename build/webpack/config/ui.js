require('dotenv').config();

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const tsImportPluginFactory = require('ts-import-plugin');
const { version } = require('../../../_raw/manifest.json');
const paths = require('../../paths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();
console.log(process.env.NODE_ENV);
const isProduction = !(process.env.NODE_ENV === 'DEV');

/**
 * For better software version control
 * Feel free to disable if you do not have git
 */
// const theLatestCommitHash = require('child_process')
//  .execSync('git rev-parse --short HEAD')
//  .toString()
//  .trim();

const config = {
  watchOptions: {
    ignored: ['background/**', '**/node_modules'],
  },
  entry: {
    ui: paths.rootResolve('src/ui/index.tsx'),
  },
  output: {
    path: paths.dist,
    filename: '[name].js',
    publicPath: '/',
  },
  module: {
    rules: [
      /* {
        test: /[\\/]ui[\\/]index.tsx/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              getCustomTransformers: () => ({
                before: [
                  tsImportPluginFactory({
                    libraryName: 'antd',
                    libraryDirectory: 'lib',
                    style: true,
                  }),
                ],
              }),
              compilerOptions: {
                module: 'es2015',
              },
            },
          },
          {
            loader: paths.rootResolve(
              'node_modules/antd-dayjs-webpack-plugin/src/init-loader'
            ),
            options: {
              plugins: [
                'isSameOrBefore',
                'isSameOrAfter',
                'advancedFormat',
                'customParseFormat',
                'weekday',
                'weekYear',
                'weekOfYear',
                'isMoment',
                'localeData',
                'localizedFormat',
              ],
            },
          },
        ],
      }, */
      {
        test: /\.jsx?$|\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        /*  oneOf: [
            {
            // prevent webpack remove this file's output even it's not been used in entry
            sideEffects: true,
            test: /[\\/]pageProvider[\\/]index.ts/,
            loader: 'ts-loader',
          },
          {
            test: /[\\/]ui[\\/]index.tsx/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  transpileOnly: true,
                  getCustomTransformers: () => ({
                    before: [
                      tsImportPluginFactory({
                        libraryName: 'antd',
                        libraryDirectory: 'lib',
                        style: true,
                      }),
                    ],
                  }),
                  compilerOptions: {
                    module: 'es2015',
                  },
                },
              },
              {
                loader: paths.rootResolve(
                  'node_modules/antd-dayjs-webpack-plugin/src/init-loader'
                ),
                options: {
                  plugins: [
                    'isSameOrBefore',
                    'isSameOrAfter',
                    'advancedFormat',
                    'customParseFormat',
                    'weekday',
                    'weekYear',
                    'weekOfYear',
                    'isMoment',
                    'localeData',
                    'localizedFormat',
                  ],
                },
              },
            ],
          },
          {
            loader: 'ts-loader',
          },
        ], */
      },
      {
        test: /\.(le|c)ss$/,
        exclude: /node_modules/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
        //  (isProduction
        //   ? [MiniCssExtractPlugin.loader]
        //   : ['style-loader']).concat(
        //       ...[
        //         {
        //           loader: 'css-loader',
        //           options: {
        //             importLoaders: 1,
        //           },
        //         },
        //         /*   {
        //     loader: 'postcss-loader',
        //   }, */
        //         {
        //           loader: 'less-loader',
        //           options: {
        //             lessOptions: {
        //               javascriptEnabled: true,
        //             },
        //           },
        //         },
        //       ]
        //     ),
      },
      /*  {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          //  {
          //   loader: 'postcss-loader',
          // },
        ],
      }, */
      {
        test: /\.(eot|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
      },
      /** {
      //   test: /\.(png|jpe?g|gif)$/i,
      //   loader: 'file-loader',
      //   options: {
      //     name: '[name].[ext]',
      //   },
      }, */
    ],
  },
  plugins: (isProduction
    ? [
        new MiniCssExtractPlugin({
          ignoreOrder: true,
        }),
      ]
    : []
  ).concat(
    ...[
      new ESLintWebpackPlugin({
        extensions: ['ts', 'tsx', 'js', 'jsx'],
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.popupHtml,
        chunks: ['vendors', 'ui'],
        filename: 'popup.html',
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.notificationHtml,
        chunks: ['vendors', 'ui'],
        filename: 'notification.html',
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.indexHtml,
        chunks: ['vendors', 'ui'],
        filename: 'index.html',
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
        React: ['react', 'default'],
        dayjs: 'dayjs',
      }),
      new webpack.DefinePlugin({
        'process.env.version': JSON.stringify(
          `${version}`
        ),
      }),
    ]
  ),
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
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          reuseExistingChunk: true,
        },
        ...(isProduction
          ? {
              uiStyles: {
                type: 'css/mini-extract',
                name: 'styles_ui',
                chunks: 'all' /* (chunk) => {
            return chunk.name === 'ui';
          }, */,
                enforce: true,
              },
            }
          : {}),
      },
    },
  },
};

module.exports = isProduction ? config : smp.wrap(config);
