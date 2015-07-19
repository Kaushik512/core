var CloudFormation = require('_pr/model/cloud-formation');
var errorResponses = require('./error_responses');

module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.all('/cloudformation/*', sessionVerificationFunc);

    app.get('/cloudformation/:cfId', function(req, res) {
        CloudFormation.getById(req.params.cfId, function(err, cloudFormation) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (cloudFormation) {
                res.send(200, cloudFormation);

            } else {
                res.send(404, {
                    message: "Not Found"
                })
            }
        });
    });

    app.get('/cloudformation/:cfId/status', function(req, res) {
        CloudFormation.getById(req.params.cfId, function(err, cloudFormation) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (cloudFormation) {
                res.send(200, {
                    status: cloudFormation.status
                });

            } else {
                res.send(404, {
                    message: "Not Found"
                })
            }
        });
    });


};