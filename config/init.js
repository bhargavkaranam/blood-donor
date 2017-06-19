'use strict';
var devEnv = require('./development/env.json');
var stageEnv = require('./staging/env.json');
var prodEnv = require('./production/env.json');

module.exports = function() { 
   switch (process.env.NODE_ENV) {
  case 'development':
    return devEnv;
  case 'testing':
    return env['testing'];
  case 'staging':
    return stageEnv;
  case 'production':
    return prodEnv;
  default:
    return devEnv;
}

}