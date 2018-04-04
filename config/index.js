require('node-path')(module);

var environment = process.env.NODE_ENV || 'development'
var resolve = require('path').resolve;
var merge = require('merge-util');
var envConf = require('./env');
var localConf = {};
var filepath = resolve(__dirname, "..", "config", environment + ".json");

try {
  console.log('Load local configuration from %s', filepath);
  localConf = require(filepath);
} catch (e) {
  console.log('Unable to read configuration from file %s: %s', filepath, e.message);
}

var conf = merge(localConf, envConf, { discardEmpty: false });
conf.environment = environment

module.exports = config;

function config(key) {
  if (has.call(conf, key)) return conf[key];
  log('Invalid config key "%s"', key);
  return undefined;
}

for (var key in conf) config[key] = conf[key];