var https = require('https');

module.exports.setRoutes = function(app, sessionVerificationFunc) {


    app.post('/notifications/aws/notify', function(req, res) {
        console.log('POST request');
        var notificationType = req.headers['x-amz-sns-message-type'];
        if (notificationType) {
            if (notificationType === 'SubscriptionConfirmation') { // confirmation notification
                var confirmationURL = req.body.SubscribeURL;
                if (confirmationURL) {
                    https.get(confirmationURL, function(res) {
                        console.log("Got response: " + res.statusCode);
                    }).on('error', function(e) {
                        console.log("Got error: " + e.message);
                    });
                    res.send(200);
                } else {
                    res.send(400);
                }

            } else if (notificationType === 'Notification') { // message notification
                console.log('Got message');
                console.log(' Notification Subject ==> ', req.body.Subject);
                console.log(' Notification Message  ==> ', req.body.Message);
                res.send(200);
            }
        } else {
            res.send(400);
        }
        console.log(req.headers);
        res.send(200);

    });

    

};