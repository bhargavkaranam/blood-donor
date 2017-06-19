'use strict';
var juice = require('juice');
module.exports = {
    hbs: function (hbsData, app) {
        return new Promise(function (resolve, reject) {

            if (process.env.NODE_ENV == 'production') {
                var address = app.locals.config['HOST'];
            }
            else if (process.env.NODE_ENV == 'staging') {
                var address = app.locals.config['HOST'];
            } else {
                var address = app.locals.config['HOST'] + app.locals.config['PORT'];
            }

            const type = hbsData.type;
            if (typeof (type) != 'undefined') {
                var mailJSON = require('../views/mailTemp/mailJSON/' + type + '.json');
            }
            else {
                reject('err');
            }
            switch (type) {
                case 'activateAccount':
                    var name = hbsData.name;
                    var email = hbsData.email;
                    var hashId = hbsData.hashId;
                    mailJSON.name = name;
                    mailJSON.email = email;
                    mailJSON.btnLink = address + '/tool/#/?hashId=' + hashId + '&email=' + email;
                    mailJSON.ignoreMail = true;
                    mailJSON.unsubscribe = false;
                    break;
                case 'invitedUser':
                    mailJSON.role = hbsData.role;
                    mailJSON.email = hbsData.email;
                    mailJSON.company = hbsData.company;
                    mailJSON.btnLink = address + '/tool/#/invited-user-login?hashID=' + hbsData.hashId + '&role=' + hbsData.role;
                    mailJSON.footerContent = type;
                    mailJSON.ignoreMail = false;
                    mailJSON.unsubscribe = true;
                    break;
                case 'upgrade':
                    mailJSON.hashId = hbsData.hashId;
                    mailJSON.upgradedPlan = hbsData.upgradedPlan;
                    mailJSON.previousPlan = hbsData.previousPlan;
                    mailJSON.footerContent = type;
                    mailJSON.ignoreMail = false;
                    mailJSON.unsubscribe = true;
                    break;
                case 'downgrade':
                    mailJSON.hashId = hbsData.hashId;
                    mailJSON.upgradedPlan = hbsData.upgradedPlan;
                    mailJSON.previousPlan = hbsData.previousPlan;
                    mailJSON.footerContent = type;
                    mailJSON.ignoreMail = false;
                    mailJSON.unsubscribe = true;
                    break;
                case 'welcome':
                    mailJSON.name = hbsData.name;
                    mailJSON.hashId = hbsData.hashId;
                    mailJSON.email = hbsData.email;
                    mailJSON.company = hbsData.company;
                    mailJSON.docsLink = address + '/support/#/docs/';
                    mailJSON.useLink = address + '/support';
                    mailJSON.ignoreMail = false;
                    mailJSON.unsubscribe = true;
                    break;
                case 'weeklyReport':
                    mailJSON = hbsData;
                    var days = 7; // Days you want to subtract
                    var date = new Date();
                    var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
                    mailJSON.dayPre = last.getDate();
                    mailJSON.monthPre = last.getMonth() + 1;
                    mailJSON.yearPre = last.getFullYear();
                    mailJSON.dayToday = date.getDate();
                    mailJSON.monthToday = date.getMonth() + 1;
                    mailJSON.yearToday = date.getFullYear();
                    mailJSON.ignoreMail = false;
                    mailJSON.unsubscribe = true;
                    break;
                case 'deactivateUser':
                    mailJSON.email = hbsData.email;
                    mailJSON.name = hbsData.name;
                    mailJSON.ignoreMail = false;
                    mailJSON.unsubscribe = false;
                    break;
                case 'upgradeMau':
                    mailJSON.email = hbsData.email;
                    mailJSON.hashId = hbsData.hashId;
                    mailJSON.oldMau = hbsData.oldMau;
                    mailJSON.newMau = hbsData.newMau;
                    break;
                case 'upgradeSubscriber':
                    mailJSON.email = hbsData.email;
                    mailJSON.hashId = hbsData.hashId;
                    mailJSON.oldSubscriber = hbsData.oldSubscriber;
                    mailJSON.newSubscriber = hbsData.newSubscriber;
                    break;
                case 'founderMailToNonSetUser':
                    mailJSON.email = hbsData.email;
                    mailJSON.hashId = hbsData.hashId;
                    mailJSON.name = hbsData.name;
                    mailJSON.ignoreMail = false;
                    break;
                case 'founderMailToSetUser':
                    mailJSON.email = hbsData.email;
                    mailJSON.hashId = hbsData.hashId;
                    mailJSON.name = hbsData.name;
                    mailJSON.ignoreMail = false;
                    break;
                case 'applyCost':
                    mailJSON.email = hbsData.email;
                    mailJSON.hashId = hbsData.hashId;
                    mailJSON.name = hbsData.name;
                    mailJSON.planMAU = hbsData.planMAU;
                    mailJSON.planSubscriber = hbsData.planSubscriber;
                    mailJSON.cost = hbsData.cost;
                    mailJSON.ignoreMail = false;
                    break;
            }

            if (typeof (type) != 'undefined') {
                _renderTemp(mailJSON, type, app).then(function (hbsTempData) {
                    resolve(hbsTempData);
                }, function (err) {
                    reject(err);
                })
            }
            else {
                reject('err');
            }

        })

    }
}
var _renderTemp = function (jsonData, tempName, app) {
    return new Promise(function (resolve, reject) {
        app.render('mailTemp/' + tempName, { layout: 'emailNew.hbs', data: jsonData }, function (err, html) {
            if (err) {
                console.log('err in rendering the templet ' + err);
                reject(err);
            }
            else {

                var hbstemp = juice(html);
                resolve(hbstemp);
            }
        })
    })

}