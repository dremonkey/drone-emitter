'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var uuid = require('node-uuid');

var db = require('./data/db');
var Loculator = require('./utils/Loculator');
var constants = require('./utils/constants');

module.exports = DroneController;

function DroneController (waypoints, homeIndex, speed) {
  this.id = uuid.v4();
  this._waypoints = waypoints;
  this._homeIndex = homeIndex;
  this._speed = speed;
}

DroneController.prototype = {
  
  /**
   * Move the drone back to it's starting location, using the fastest route
   * possible
   * 
   * @return {Promise}
   */
  abort: function () {
    return db.Drone.get(this.id)
    .then(function (data) {
      var home = data.home;
      var destination = data.waypoints[home];
    });
  },

  /**
   * Moves the drone and ensures that the database has the latest information.
   * This will recursively call itself
   * 
   * @return {[type]} [description]
   */
  move: function () {

    var _this = this;
    var id = this.id;

    db.Drone.get(id)
    .tap(function (data) {
      // status can be set to COMMANDS.STOP to abort an active move
      // if (data.status !== constants.COMMANDS.MOVE && 
      //     data.status !== constants.STATUS.MOVING ) {
      if (data.status === constants.COMMANDS.STOP) {
        return Promise.reject('STOP');
      }
    })
    .then(function (data) {
      var loculator;
      var current = data.location;
      var destination = data.waypoints[data.nextWaypoint];
      var speed = data.speed;
      
      loculator = new Loculator(current, destination, speed);
      
      return loculator.getNext()
      .then(function (location) {
        return [
          location,
          destination,
          data.waypoints,
          data.nextWaypoint
        ];
      });
    })
    .spread(function (location, destination, waypoints, nextWaypoint) {
      var promise;
      
      // reached the waypoint
      if (_.isEqual(location, destination)) {
        promise = db.Drone.update(id, {
          location: location,
          lat: location.lat,
          lng: location.lng,
          lastWaypoint: nextWaypoint,
          nextWaypoint: (nextWaypoint + 1) % waypoints.length,
          status: constants.STATUS.MOVING
        });
      } 
      else {
        // set the drone's new location
        promise = db.Drone.update(id, {
          location: location,
          lat: location.lat,
          lng: location.lng,
          status: constants.STATUS.MOVING
        });
      }

      return promise;
    })
    .then(function () {
      // repeat
      _this.move();
    })
    .catch(function (err) {
      if (err === 'STOP') {
        _this.stop();
      } else {
        throw new Error(err);
      }
    });
  },

  /**
   * Register the drone
   * 
   * @return {Promise}
   */
  register: function () {
    var _this = this;
    var id = this.id;
    var waypoints = this._waypoints;
    var homeIndex = this._homeIndex;
    var home = waypoints[homeIndex];
    var speed = this._speed;

    var data = {
      id: id,
      home: home,
      location: home,
      lat: home[0],
      lng: home[1],
      lastWaypoint: homeIndex,
      nextWaypoint: (homeIndex + 1) % waypoints.length,
      speed: speed,
      status: constants.STATUS.STOPPED,
      waypoints: _.reduce(waypoints, function (waypoints, waypoint) {
        return waypoints.concat(arrayToLatLng(waypoint));
      }, [])
    };

    return db.Drone.create(data)
    .then(function () {
      db.Drone.watchStatus(id, _this.onStatusChange.bind(_this));
      return id;
    });
  },

  stop: function () {
    var id = this.id;
    return db.Drone.updateStatus(id, constants.STATUS.STOPPED);
  },

  onStatusChange: function (status, oldStatus) {

    var id = this.id;

    console.log('Drone `%s` status changed to `%s`', id, status);

    switch (status) {
      case constants.COMMANDS.ABORT:
        this.abort();
        break;
      case constants.COMMANDS.MOVE:
        this.move();
        break;
      case constants.COMMANDS.STOP:
        this.stop();
        break;
    }
  }
};

////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////

function arrayToLatLng (obj) {
  if (Array.isArray(obj)) {
    return {
      lat: obj[0],
      lng: obj[1]
    };
  } else {
    return obj;
  }
}