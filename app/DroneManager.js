'use strict';

var db = require('./data/db');
var constants = require('./utils/constants');

function DroneManager (socket) {
  this._socket = socket;
  this.droneId = '';
}

DroneManager.prototype = {
  connect: function (drone) {

    this.droneId = drone.id;

    // check if already registered
    return db.Drone.get(drone.id)
    .then(function (res) {
      if (res === null) {
        return db.Drone.create(drone);
      }
      return res;
    });
  },
  
  disconnect: function () {
    var _this = this;

    return db.Drone.update(this.droneId, {
      status: constants.STATUS.DISCONNECTED
    })
    .then(function () {
      delete _this._socket;
      _this.droneId = '';
    });
  },

  update: function (data) {
    return db.Drone.update(this.droneId, data);
  }
};

module.exports = DroneManager;