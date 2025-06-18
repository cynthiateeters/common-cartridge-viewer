const path = require("path");

module.exports = {
  webpack: {
    configure: webpackConfig => {
      // Add fallback for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: require.resolve("path-browserify")
      };

      // Disable the ModuleScopePlugin which restricts imports outside src/
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        plugin => plugin.constructor.name !== "ModuleScopePlugin"
      );

      return webpackConfig;
    }
  }
};
