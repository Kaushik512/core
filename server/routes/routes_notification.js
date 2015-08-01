module.exports.setRoutes = function(app, sessionVerificationFunc) {


    app.post('/notification/aws/notify', function(req, res) {
        console.log('POST request');

        console.log(req.body);
        res.send(200);

    });

    app.get('/notification/aws/notify', function(req, res) {
        console.log('GET request');
        res.send(200);
    });

};