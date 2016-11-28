var express = require('express');
var geocoder = require('geocoder');
var Container = require('../models/container');
var router = express.Router();
var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyAgjlXMQ_h6MIUTgEeheA0nfPlyBjr_6hY'
});

var latLong = '';

router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

// ========== PUT endpoint to set percentageFull to 0 on all containers with percentageFull greater than request =====//
router.put('/clear', function(req, res) {
    var llenado = req.body.llenado;
    console.log("Inside clear function with llenado " + llenado);
    if (llenado !== undefined && llenado !== "") {
        Container.find({ percentageFull: { $gt: llenado } }, function(err, containers) {
            if (err) {
                return next(err);
            }
            containers.forEach(function(container) {
                console.log("Clearing percentageFull of container: " + container.containerId);
                container.percentageFull = 0;
                container.timesCleared = container.timesCleared + 1;
                container.save(function(err, updatedContainer) {
                    if (err) {
                        return next(err);
                    }
                });
            });
            res.send("Containers updated successfully!");
        });
    } else {
        res.send("Wrong parameter passed to the service !");
    }
});

// ======= Create endpoint /api/containers for POSTS ============= //
router.post('/container', function(req, res) {
    // Create a new instance of a Container
    var cont = new Container();
    // Set the container properties that came from the POST data

    searchAddress(req.body.address, function(error, dir) {
        if (error) {
            console.log('Error attempting to call google maps geocoder', error);
            return res.status(500).send(error);
        }
        cont.address = req.body.address;
        cont.lat = JSON.parse(dir).lat;
        cont.lng = JSON.parse(dir).lng;
        cont.percentageFull = req.body.percentageFull;
        cont.containerId = req.body.containerId;

        // Save the container in DB and check for errors
        cont.save(function(err) {
            if (err) {
                console.log('500', err);
                res.status(500).send(err);
            }

            res.json({ message: 'Container information added to the database!', data: cont });
        });
    });
});

// ========= RETURNS ALL ADDRESSES ON DB ==============//
router.get('/addresslist', function(req, res) {
    var llenado = 50;

    if (req.query.llenado !== undefined && req.query.llenado !== "") {
        llenado = req.query.llenado;
    }
    console.log("Finding containers with percentageFull > " + llenado);
    Container.find({ percentageFull: { $gt: llenado } }, function(err, containers) {
        var containerMap = {};

        containers.forEach(function(container) {
            console.log("Container info: " + container.address);
            containerMap[container._id] = container.address;
        });

        res.send(containerMap);
    });
});

// ========= RETURNS ALL ADDRESSES ON DB ==============//
router.get('/geocodedlist', function(req, res) {
    Container.find({}, function(err, containers) {
        var containerMap = {};

        containers.forEach(function(container) {
            console.log("Container info: " + container.address);
            containerMap[container._id] = {
                lat: container.lat,
                lng: container.lng,
                containerId: container.containerId,
                percentageFull: container.percentageFull
            };

        });

        res.send(containerMap);
    });
});

router.get('/container', function(req, res) {
    Container.find({}, function(err, containers) {
        res.send(containers);
    });
});

// ======== TEST COMMUNICATION END POINT FOR ARDUINO/APP ==============//
router.get('/test', function(req, res) {
    var parameter = req.query.llenado;
    var id = req.query.containerId;

    Container.findOne({ containerId: id }, function(err, container) {
        if (err) {
            return next(err);
        }
        container.percentageFull = parameter;
        container.save(function(err, updatedContainer) {
            if (err) {
                return next(err);
            }
            res.send(updatedContainer);
        });
    });
});

// ========= DELETE CONTAINER BY ID ==================== //
router.delete('/delete', function(req, res) {
    var id = req.body.containerId;
    console.log("Attempting to delete container with id: " + id);
    Container.find({ containerId: id }).remove().exec();

    res.json({ message: 'Container deleted successfully!', data: Container });
});

//======== GEOCODE -- TRANSFORM ADDRESS INTO LAT/LONG =================//
function searchAddress(ad, callback) {

    if (typeof(geocoder) == 'undefined') geocoder = new google.maps.Geocoder();

    geocoder.geocode(ad, function(results, status) {
        if (status.status == 'OK') {
            callback(null, JSON.stringify(status.results[0].geometry.location));
        } else { // if status value is not equal to "google.maps.GeocoderStatus.OK"
            callback(status, null);
            console.log("The Geocode was not successful for the following reason: " + JSON.stringify(status));
        }
    });
}

module.exports = router;
