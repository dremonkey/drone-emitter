'use strict';

var _ = require('lodash');
var r = require('rethinkdb');
var requireDir = require('require-dir');

var config = require('../config');
var schema = require('./schema');
var Models = requireDir('../models');

var exports;
var connections = {};

var database = {
  host: process.env.DB_HOST || 'localhost',
  port: 28015,
  db: config.database.db
};

module.exports = exports = _.extend({
  init: init,
  newConnection: newConnection,
}, Models);

function init () {
  return r.connect(database)
  .tap(function (conn) {
    return schema.init(conn);
  })
  .then(function () {
    _.forEach(Models, function (Model, name) {
      exports[name] = new Model();
    });
  })
  .catch(function (err) {
    console.log(err);
  });
}

function newConnection (name) {
  if (name && connections[name]) {
    connections[name] = r.connect(database);
    return connections[name];
  } else {
    return r.connect(database);
  }
}