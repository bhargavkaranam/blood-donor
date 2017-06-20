"use strict"

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var donor_col = require('../controller/model/donor');
var assert = require('assert');

module.exports = function (io) {


    

    // create new donor
    // var donor = new donor_col({
    //     firstName: 'Chris',
    //     lastName: 'sevilayha',
    //     age: 25,
    //     bloodGroup: 'A+',
    //     url: 6876868,
    //     lat: 127.01,
    //     long: 167,
    //     radius: 0
    // });


    // donor.setRadius(function (err, name) {
    //     if (err) throw err;

    //     console.log('Radius name is ' + radius);
    // });


    io.on('connection', function (socket) {
        console.log('a user connected');

        socket.on('newDonor', function (donorObj) {

            // call the built-in save method to save to the database
            var donor = new donor_col({
                firstName: donorObj.firstName,
                lastName: donorObj.lastName,
                
                bloodGroup: donorObj.blood,
                url: Date.now(),
                lat: donorObj.clickedX,
                long: donorObj.clickedY,
                radius: 0
            });
            donor.save(function(err) {
              if (err) {
                socket.emit('result',false);
                throw err;

            }

              socket.emit('result',true);
            });
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

