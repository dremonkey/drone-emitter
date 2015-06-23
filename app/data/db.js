'use strict';

var _ = require('lodash');
var r = require('rethinkdb');
var requireDir = require('require-dir');

var schema = require('./schema');
var config = require('../config');
var Models = requireDir('../models');

var exported;
var connections = {};

module.exports = exported = _.extend({
  init: init,
  newConnection: newConnection,
}, Models);

function init () {
  return r.connect(config.database)
  .tap(function (conn) {
    return schema.init(conn);
  })
  .then(function (conn) {
    _.forEach(Models, function (Model, name) {
      exported[name] = new Model();
    });
  })
  .catch(function (err) {
    console.log(err);
  });
}

function newConnection (name) {
  if (name && connections[name]) {
    connections[name] = r.connect(config.database);
    return connections[name];
  } else {
    return r.connect(config.database);
  }
}