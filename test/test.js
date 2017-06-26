var mongoose = require("mongoose");  
// var customer = require("../lib/customers");  
//tell Mongoose to use a different DB - created on the fly
mongoose.connect('mongodb://test:test123@ds137882.mlab.com:37882/blood_donor');  


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

var donor_col = mongoose.model('donor_test', donor_schema);

var chai = require('chai');

var should = chai.should();

describe("Users", function(){  
  var currentUser = null;  

  beforeEach(function(done){    
    //add some test data 
    var donor = new donor_col({
      firstName: "Test",
      lastName: "Test Last",

      bloodGroup: "B+",
      lat: 17.7689,
      long: 20.7678,
      mobile: '0091 812 3637 692',
      email: 'test@gmail.com',
      radius: 0
    });
    donor.save(function(err,donorObj) {   

      currentUser = donorObj;      
      done();    
    });  
  });  

  afterEach(function(done){    
    donor_col.remove({}, function() {      
      done();    
    });  
  });

  it("registers a new user", function(done){    

    var donor = new donor_col({
      firstName: "Test",
      lastName: "Test Last",

      bloodGroup: "B+",
      lat: 17.7689,
      long: 20.7678,
      mobile: '0091 812 3637 692',
      email: 'test@gmail.com',
      radius: 0
    });
    donor.save(function(err,donorObj) {

      donorObj.email.should.equal("test@gmail.com");      
      
      done();    
    });
  }); 

  it("retrieves by userid", function(done){    
    donor_col.findOne({_id: currentUser._id},function (err, doc) {    
      doc.email.should.equal("test@gmail.com");       
      done();    
    });  
  });  

  

  it("updates user details", function(done){    
    donor_col.findById({_id: currentUser._id},function(err,donor){
      donor.email = "test2@gmail.com";
      donor.save(function(err,donorObj) {
        donorObj.email.should.equal("test2@gmail.com");      
        done();    
      });
    
    });  
  });

  it('deletes a donor',function(done){
    donor_col.remove({_id: currentUser._id},function(err,results){
      donor_col.findOne({_id: currentUser._id},function (err, doc) {    
      
      should.equal(doc,null);
      done();
    });
    });
  })

  
});
