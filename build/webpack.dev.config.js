const webpack = require('webpack');
/* const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin; */
// for extension local test, can build each time
const config = {
  mode: 'development',
  devtool: 'inline-cheap-module-source-map',
  watch: true,
  watchOptions: {
    ignored: ['**/public', '**/node_modules'],
    followSymlinks: false,
  },
  resolve: {
    fallback: { "path": require.resolve("path-browserify") }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BUILD_ENV': JSON.stringify('DEV'),
      'process.env.INFURA_PROJECT_ID': JSON.stringify(
        process.env.INFURA_PROJECT_ID
      ),
      'process.env.REDUX_DEVTOOL_ENABLED': JSON.stringify(
        process.env.REDUX_DEVTOOL_ENABLED
      ),
    }),
    // new BundleAnalyzerPlugin(),
  ],
};

module.exports = config;
