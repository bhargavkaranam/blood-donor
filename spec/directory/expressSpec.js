
/* 
//testing ./config/express.js

**/
'use strict';

var request = require("request");

var app = require('../../config/express')();

var base_url = "http://localhost:5290/";


describe("Testing Response Status",function()
{


it('*', function (done){
    request.get(base_url, function(err,response){
      
        expect(response.statusCode).toBe(200);
        done();
    });
});


//it("anything",function(done)
//{
//}
});