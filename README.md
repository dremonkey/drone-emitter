# Drone Emitter

Experiment with RethinkDB and Docker to create a backend that mocks a bunch of 
drones relaying their positions and status in realtime back to the database. 
The drones follow a pre-planned route (set of harcoded waypoints) and are each 
assigned a home location that corresponds with one of the waypoints in its route.

## Usage

Assuming you have docker and docker-compose already installed...

```
$ docker-compose up
```