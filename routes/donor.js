var express = require('express');
var router = express.Router();

var donor_col = require('../controller/model/donor');


var assert = require('assert');

router.test = function(io) {
	return function(req,res) {
		io.sockets.emit('message',"Hello world");
		res.end('done');
	}
}

router.getDetails = function(req,res) {

	var uid = req.body.uid;
	
	
	
	donor_col.findOne({_id: uid},function (err, results) {
		if(err) {
			res.json({status: false})
		}
		else 
			res.json({status: true,results: results});
	});
}

router.delete = function(io) {
	return function(req,res) {
		console.log(req.body.id);
		donor_col.remove({_id: req.body.id},function(err,results){
			if(err) {
				console.log(err);
				res.json({status: false})
			}
			else {
				donor_col.find(function (err, results) {
					console.log(results);
					assert.equal(null, err);
					io.sockets.emit('results',results);
					res.json({status: true});
				});
				
			}
		})
	}
};


router.save = function(io) {
	return function(req,res) {
		var donor = new donor_col({
			firstName: req.body.firstName,
			lastName: req.body.lastName,

			bloodGroup: req.body.blood,
			lat: req.body.clickedX,
			long: req.body.clickedY,
			mobile: req.body.mobile,
			email: req.body.email,
			radius: 0
		});
		donor.save(function(err,donorObj) {
			if (err) {
				res.json({status: false});
			}
			else {
				
				
				io.sockets.emit('newDonor',donorObj);
				res.json({status: true,uid: donor.id});
				
				

				
			}
		});
	}
}


router.update = function(io) {
	return function(req,res) {
		donor_col.findById(req.body.id,function(err,donor){
			donor.firstName = req.body.firstName;

			donor.lastName = req.body.lastName,

			donor.bloodGroup = req.body.blood,
			donor.lat = req.body.clickedX,
			donor.long = req.body.clickedY,
			donor.mobile = req.body.mobile,
			donor.email = req.body.email,
			donor.radius = 0
			donor.save(function(err,donorObj){
				if (err) {
					res.json({status: false});
					// throw err;

				}
				else {
					
					donor_col.find(function (err, results) {
						console.log(results);
						assert.equal(null, err);
						io.sockets.emit('results',results);
						res.json({status: true,uid: donorObj.id});
					});
					
					
					
					


				}
			})
		})

	}
}

router.deleteAll = function(req,res) {
	donor_col.remove({},function(err,results){
		res.end("Done");
	})
}

router.emitAllRecords = function(io) {
	io.on('connection',function(socket){
		donor_col.find(function (err, results) {
			console.log(results);
			assert.equal(null, err);
			socket.emit('results',results);
		});
	});
}




module.exports = router;