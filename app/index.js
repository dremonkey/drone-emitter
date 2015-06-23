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


function init (numOfDrones) {

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
  .then(function (ids) {
    // start moving some of the drones
    _.forEach(ids, function (id, index) {
      if (index % 3) {
        DroneManager.move(id);
      }
    });
  });
}

init();