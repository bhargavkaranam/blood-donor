'use strict';

module.exports = function(app) {  
    global.getMailPath =  app.locals.config['MAIL_PATH'];
}