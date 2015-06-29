'use strict';

/**
 * @module  drone-overmind
 */

var db = require('./data/db');
var AnsibleNexus = require('./AnsibleNexus');

db.init()
.then(function () {
  AnsibleNexus.init(process.env.SOCKET_IO_PORT);
});