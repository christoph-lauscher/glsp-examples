/**
 * This file can be edited to customize webpack configuration.
 * To reset delete this file and rerun theia build again.
 */
// @ts-check
const path = require('path');
const configs = require('./gen-webpack.config.js');
const nodeConfig = require('./gen-webpack.node.config.js');

for (const config of configs) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
        ...config.resolve.alias,
        '@theia/core/shared/inversify$': path.resolve(__dirname, 'inversify-container.js')
    };
}

/**
 * Expose bundled modules on window.theia.moduleName namespace, e.g.
 * window['theia']['@theia/core/lib/common/uri'].
 * Such syntax can be used by external code, for instance, for testing.
configs[0].module.rules.push({
    test: /\.js$/,
    loader: require.resolve('@theia/application-manager/lib/expose-loader')
}); */

module.exports = [
    ...configs,
    nodeConfig.config
];
