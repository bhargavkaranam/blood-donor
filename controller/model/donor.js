"use strict"

var mongoose = require('mongoose');

mongoose.connect('mongodb://root:root@ds123312.mlab.com:23312/blood_donation_app');

var Schema = mongoose.Schema;

var donor_schema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  bloodGroup: { type: String },

  email: {type: String},

  mobile: { type: String},

  url: { type: Date, default: Date.now },
  lat: { type: Number, index : true },
  long: { type: Number, index : true},
  radius : {type: Number, index : true}
});

donor_schema.methods.setRadius = function() {

  this.radius = this.lat + this.long; 

  return this.radius;
};

var donor = mongoose.model('donor', donor_schema);

module.exports = donor;

 