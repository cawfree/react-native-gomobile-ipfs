const {
  withPlugins,
  AndroidConfig,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const { name, version } = require('./package.json');

const withGoMobileIpfs = (config, props = {}) => {
  if (!config.ios) config.ios = {};
  if (!config.ios.infoPlist) config.ios.infoPlist = {};

  config.ios.infoPlist.NSBluetoothAlwaysUsageDescription =
    props.bluetoothPermissionText ??
    config.ios.infoPlist.NSBluetoothAlwaysUsageDescription ??
    '$(PRODUCT_NAME) needs access to Bluetooth.';

  const androidPermissions = [];

  return withPlugins(config, [
    [AndroidConfig.Permissions.withPermissions, androidPermissions],
  ]);
};

module.exports = createRunOncePlugin(withGoMobileIpfs, name, version);
