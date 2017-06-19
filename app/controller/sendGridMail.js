'use strict';
var fs = require('fs');
var path = require('path');

module.exports = {

    send: function (fromEmail, toEmail, hbsTemplate, subject, app, attachment) {

        var sg = require("sendgrid")(app.locals.config['SendGrid_API_KEY']);
        var bccEmail = '';
        var personalizationsArr = [];
        personalizationsArr = [];
        if (typeof (toEmail) === 'object') {
            var primaryMail = toEmail.primaryMail;
            bccEmail = toEmail.bccEmail;
            var personalizationsObj = {
                to: [
                    {
                        email: primaryMail
                    }
                ],
                bcc: [
                    {
                        email: bccEmail
                    }
                ],
                subject: subject
            }
            personalizationsArr.push(personalizationsObj);
        }
        else {
            var primaryMail = toEmail;
            var personalizationsArr = [];
            var personalizationsObj =  {
                to: [
                    {
                        email: primaryMail
                    }
                ],
                subject: subject
            }
            personalizationsArr.push(personalizationsObj);
        }
        // checks 
        if(typeof fromEmail === 'object') {

        if (attachment) {
            var file = fs.readFileSync(path.join(__dirname, '../../') + attachment.filename);
            var base64File = new Buffer(path.join(__dirname, '../../') + attachment.filename).toString('base64');
            console.log('base64 file  ' + base64File);

            var request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: {
                    personalizations: personalizationsArr,
                    from: fromEmail,
                    content: [
                        {
                            type: "text/html",
                            value: hbsTemplate
                        }
                    ],
                    attachments: [
                        {
                            type: "application/pdf",
                            content: base64File,
                            fileName: attachment.filename,
                            disposition: "attachment"
                        }
                    ]
                }
            });
        } else {

            var request = sg.emptyRequest({
                method: "POST",
                path: "/v3/mail/send",
                body: {
                    personalizations: personalizationsArr,
                    from: fromEmail,
                    content: [
                        {
                            type: "text/html",
                            value: hbsTemplate
                        }
                    ]
                }
            });
        }

        return sg.API(request);
    } // end of checks

    }
}