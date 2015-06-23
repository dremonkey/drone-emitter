'use strict';

var Firebase = require('firebase');
var Promise = require('bluebird');

var FB_URI = 'https://fleet.firebaseio.com/';
var baseRef = new Firebase(FB_URI);

module.exports = {
  ref: baseRef,
  waypoints: baseRef.child('waypoints'),
  drones: baseRef.child('drones'),
  
  getDroneData: function (id) {
    return new Promise(function (resolve, reject) {
      baseRef.child('drones').child(id).once('value', function (snapshot) {
        var data = snapshot.val();
        resolve(data);
      }, function (err) {
        reject(err);
      });
    })
    .catch(function (err) {
      console.error(err);
    });
  },

  setDroneData: function (id, data) {
    return new Promise(function (resolve, reject) {
      baseRef.child('drones').child(id).set(data, function (err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(err);
      });
    })
    .catch(function (err) {
      console.error(err);
    });
  },

  updateDroneData: function (id, data) {
    return new Promise(function (resolve, reject) {
      baseRef.child('drones').child(id).update(data, function (err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(err);
      });
    })
    .catch(function (err) {
      console.error(err);
    });
  }
};
