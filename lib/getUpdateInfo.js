'use strict';

var request = require('request');

var pkg = require('../package');
var pkgName = pkg.name;

module.exports = function(callback) {

  var options = {
    method: 'GET',
    timeout: 3000,
    url: `http://registry.npmjs.org/${pkgName}/latest`
  };

  request(options, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonBody = JSON.parse(body);
      callback(jsonBody.version);
    } else {
      callback(null);
    }
  });
};
