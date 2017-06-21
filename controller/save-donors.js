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


    function emitAllRecords(socket) {
        donor_col.find(function (err, results) {
            console.log(results);
            assert.equal(null, err);
            socket.emit('results',results);
        });
    }


    io.on('connection', function (socket) {
      //  console.log('a user connected');
        emitAllRecords(socket);
        socket.on('newDonor', function (donorObj) {

            // call the built-in save method to save to the database

            if(donorObj.id) {
                donor_col.findById(donorObj.id,function(err,donor){
                    donor.firstName = donorObj.firstName;

                    donor.lastName = donorObj.lastName,

                    donor.bloodGroup = donorObj.blood,
                    donor.lat = donorObj.clickedX,
                    donor.long = donorObj.clickedY,
                    donor.mobile = donorObj.mobile,
                    donor.email = donorObj.email,
                    donor.radius = 0
                    donor.save(function(err,donor){
                        if (err) {
                            socket.emit('result' + donor.id ,{status: false});
                            throw err;

                        }

                        socket.emit('result' + donor.id,{status: true,uid: donor.id});
                        emitAllRecords(socket);
                    })
                })

            
            }
            else {


                var donor = new donor_col({
                    firstName: donorObj.firstName,
                    lastName: donorObj.lastName,

                    bloodGroup: donorObj.blood,
                    lat: donorObj.clickedX,
                    long: donorObj.clickedY,
                    mobile: donorObj.mobile,
                    email: donorObj.email,
                    radius: 0
                });
                donor.save(function(err,donor) {
                  if (err) {
                    socket.emit('result' + donor.id,{status: false});
                    throw err;

                }

                socket.emit('result' + donor.id,{status: true,uid: donor.id});
                emitAllRecords(socket);
            });
            }
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

