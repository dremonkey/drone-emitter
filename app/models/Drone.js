'use strict';

var r = require('rethinkdb');

var tablename = 'drones';

function Model () {}

Model.prototype = {

  get: function get (id) {
    var db = require('../data/db');

    return db.newConnection()
    .then(function (conn) {
      return r.table(tablename).get(id).run(conn)
      .tap(function () {
        conn.close();
      });
    });
  },

  getAll: function getAll () {
    var db = require('../data/db');
    
    return db.newConnection()
    .then(function (conn) {
      return r.table(tablename).run(conn)
      .tap(function () {
        conn.close();
      });
    });
  },
  
  create: function create (data) {
    var db = require('../data/db');
    
    return db.newConnection()
    .then(function (conn) {
      return r.table(tablename).insert(data).run(conn)
      .tap(function () {
        conn.close();
      });
    });
  },

  update: function update (id, data) {
    var db = require('../data/db');
    
    return db.newConnection()
    .then(function (conn) {
      return r.table(tablename).get(id).update(data).run(conn)
      .tap(function () {
        conn.close();
      });
    });
  },

  updateStatus: function updateStatus (id, status) {
    var db = require('../data/db');

    return db.newConnection()
    .then(function (conn) {
      return r.table(tablename).get(id).update({
        status: status
      })
      .run(conn)
      .tap(function () {
        conn.close();
      });
    });
  },

  destroy: function destroy (id) {
    var db = require('../data/db');

    return db.newConnection()
    .tap(function (conn) {
      return r.table(tablename).get(id).delete().run(conn)
      .tap(function () {
        conn.close();
      });
    });
  },

  destroyAll: function destroyAll () {
    var db = require('../data/db');

    // reset the table
    return db.newConnection()
    .tap(function (conn) {
      return r.table(tablename).wait().run(conn);
    })
    .tap(function (conn) {
      return r.table(tablename).delete().run(conn)
      .tap(function () {
        conn.close();
      });
    });
  },

  watchStatus: function watchStatus (id, cb) {
    
    var prevStatus;
    var db = require('../data/db');

    // open changefeeds on their own connection to prevent blocking the
    // main connection
    // @see http://rethinkdb.com/api/javascript/changes/ 
    db.newConnection('droneStatus')
    .then(function (conn) {
      r.table(tablename).get(id).changes().run(conn, function (err, cursor) {
        cursor.each(function (err, change) {
          var newVal = change && change.new_val;
          if (newVal && 
              newVal.status && 
              prevStatus !== newVal.status) {
            cb(newVal.status, prevStatus);
            prevStatus = newVal.status;
          }
        });
      });
    });
  }
};

module.exports = Model;
