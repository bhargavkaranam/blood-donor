'use strict';

module.exports ={
   env:function(){ 
       if(process.env.NODE_ENV === 'production'){
            var config = require('./prod/gulp_data.json');
           return config;
       }
       if(process.env.NODE_ENV === 'development'){
           var config = require('./dev/gulp_data.json');
           return config;
       }
       if(process.env.NODE_ENV === 'staging'){
           var config = require('./stage/gulp_data.json');
           return config;
       }
    }
}