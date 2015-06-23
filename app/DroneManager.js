'use strict';

var requireDir = require('require-dir');

var constants = require('./utils/constants');
var DroneController = require('./DroneController');

var SPEED = 20; // meters per second

module.exports = {
  create: function () {
    return new DroneManager();
  }
};

function DroneManager () {
  this._drones = {};
}

DroneManager.prototype = {
  
  abort: function (id) {
    var controller = this._drones[id];
    return controller.abort();
  },

  move: function (id) {
    var controller = this._drones[id];
    controller.move();
  },

  stop: function (id) {
    var controller = this._drones[id];
    return controller.stop();
  },
  
  register: function (waypoints, homeIndex) {
    var _this = this;
    var controller = new DroneController(waypoints, homeIndex, SPEED);

    return controller.register()
    .tap(function (id) {
      _this._drones[id] = controller;
    });
  }
};