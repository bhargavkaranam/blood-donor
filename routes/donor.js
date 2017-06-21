var express = require('express');
var router = express.Router();

var donor_col = require('../controller/model/donor');

router.getDetails = function(req,res) {

	var uid = req.body.uid;
	
	
	
	donor_col.findOne({_id: uid},function (err, results) {
		if(err) {
			res.json({status: false})
		}
		res.json({status: true,results: results});
	});
}



module.exports = router;