'use strict';

/**
 * @module  drone-emitter
 */

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var db = require('./data/db');
var DroneManager = require('./DroneManager').create();

var filePath = path.resolve(__dirname, './resources/waypoints.txt');
var WAYPOINTS = JSON.parse(fs.readFileSync(filePath, 'utf8'));

module.exports = {
  init: function (numOfDrones) {

    numOfDrones = numOfDrones || 20;

    db.init()
    .then(function () {
      return db.Drone.destroyAll();
    })
    .then(function () {
      var promises = [];
      
      for (var i = 0; i < numOfDrones; i++) {
        var home = i % WAYPOINTS.length; // waypoint that will be set as HOME
        promises.push(DroneManager.register(WAYPOINTS, home));
      }

      return Promise.all(promises);
    })
    .then(function () {
      return DroneManager;
    });
    // .then(function (ids) {
    //   // start all drones
    //   _.forEach(ids, function (id) {
    //     DroneManager.move(id);
    //   });
    // });
  }
};