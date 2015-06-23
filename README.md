# Drone Emitter

Experiment with RethinkDB and Docker to create a backend that mocks a bunch of 
drones relaying their positions and status in realtime back to the database. 
The drones follow a pre-planned route (set of harcoded waypoints) and are each 
assigned a home location that corresponds with one of the waypoints in its route.

## Usage

```
var droneEmitter = require('drone-emitter');

droneEmitter.init(10) // initialize 10 drones
.then(function (droneManager) {
  // use the droneManager to manage (move, stop, abort)
}); 
```