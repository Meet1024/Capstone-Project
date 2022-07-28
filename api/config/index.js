let environment = "dev";
// let environment = "prod";

let configFiles = {
  dev: {
    config: "./dev/config.js",
  },
  prod: {
    config: "./prod/config.js",
  },
};

const configFilePath = configFiles[environment].config;

let configFile = require(configFilePath);

module.exports = configFile;
