'use strict';

var io = require('socket.io');
var DroneManager = require('./DroneManager');
var constants = require('./utils/constants');

function AnsibleNexus () {
  this._managers = {};
}

AnsibleNexus.prototype = {
  init: function (port) {
    io = io(port);
    io.sockets.on('connection', function (socket) {

      console.log('Drone connected on %s', socket.id);
      
      var _this = this;
      var manager = new DroneManager(socket);

      socket.on('drone:connect', function (drone) {
        manager.connect(drone)
        .then(function () {
          // TEMP
          fakeCommands(_this, drone.id);
        });

        _this._managers[drone.id] = socket.id;
      });

      socket.on('disconnect', function () {
        console.log('Drone disconnected from %s', socket.id);
        manager.disconnect();
        delete _this._managers[manager.droneId];
      });

      socket.on('drone:update', manager.update.bind(manager));
    }.bind(this));
  },

  relayCommand: function (droneId, command, data) {
    var connected = io.sockets.connected;
    var socketId = this._managers[droneId];
    var socket = connected[socketId];

    socket.emit('overmind:' + command, data);
  }
};

module.exports = exports = new AnsibleNexus();

function fakeCommands (nexus, droneId) {
  // TEMP
  nexus.relayCommand(droneId, constants.COMMANDS.MOVE);

  setTimeout(function () {
    nexus.relayCommand(droneId, constants.COMMANDS.STOP);
  }, 100000);
}