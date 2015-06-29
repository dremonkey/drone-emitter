'use strict';

var _ = require('lodash');
var r = require('rethinkdb');
var Promise = require('bluebird');

var config = require('../config');

var dbname = config.database.db;
var tables = config.database.tables;

module.exports = {
  init: init
};

function init (conn) {
  return initDatabase(conn)
  .then(function () {
    var promises = [];
    
    _.forEach(tables, function (tablename) {
      promises.push(createTable(conn, tablename));
    });

    return Promise.all(promises);
  });
}

function initDatabase (conn) {
  return r.dbList().run(conn)
  .then(function (list) {
    if (!_.includes(list, dbname)) {
      return r.dbCreate(dbname).run(conn);
    }
    return list;
  });
}

function createTable (conn, tablename) {
  return r.tableList().run(conn)
  .then(function (list) {
    if (!_.includes(list, tablename)) {
      return r.db(dbname).tableCreate(tablename).run(conn);
    }
    return list;
  });
}