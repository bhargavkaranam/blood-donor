"use strict"

var mongoose = require('mongoose');
var donor_col = require('../controller/model/donor');
var assert = require('assert');

module.exports = function (app) {

    var io = app.locals.io;

    // create new donor
    var donor = new donor_col({
        firstName: 'Chris',
        lastName: 'sevilayha',
        age: 25,
        bloodGroup: 'A+',
        url: 6876868,
        lat: 127.01,
        long: 167,
        radius: 0
    });


    donor.setRadius(function (err, name) {
        if (err) throw err;

        console.log('Radius name is ' + radius);
    });


    io.on('connection', function (socket) {
        console.log('a user connected');

        socket.on('newDonor', function (donorObj) {

            // call the built-in save method to save to the database

            // donor.save(function(err) {
            //   if (err) throw err;

            //   console.log('Donor saved successfully!');
            // });
        })

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    })



    // display the records
    // donor_col.find(function (err, results) {
    //     assert.equal(null, err);
    //     console.log(results);
    // });

}

