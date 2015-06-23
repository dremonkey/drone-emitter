'use strict';

var _ = require('lodash');
var r = require('rethinkdb');
var config = require('../config');
var dbname = config.database.db;

module.exports = {
  init: init
};

function init (conn) {
  return initDatabase(conn)
  .then(function () {
    return createTable(conn, 'drones');
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