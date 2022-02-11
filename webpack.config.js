const lodash = require('lodash');
const webpackMerger = require('webpack-merge');

const moduleConfigs = {
  background: require('./build/webpack/config/background'),
  contentScripts: require('./build/webpack/config/content-scripts'),
  ui: require('./build/webpack/config/ui'),
};

const envConfigs = {
  dev: require('./build/webpack.dev.config'),
  pro: require('./build/webpack.pro.config'),
};

const config = (env) => {
  let resultConfig = {};
  if (env.config && env.module) {
    resultConfig = webpackMerger.mergeWithRules({
      customizeArray(a, b, key) {
        // Fall back to default merging
        return [...a, ...b];
      },
      customizeObject(a, b, key) {
        // Fall back to default merging
        return { ...a, ...b };
      },
    })(moduleConfigs[env.module], envConfigs[env.config]);
  } else {
    console.error('you must set config and module');
    process.exit(1);
  }

  return resultConfig;
};

module.exports = config;
