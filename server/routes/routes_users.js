var logger = require('_pr/logger')(module);
var congigMgmntDao = require('../model/d4dmasters/configmgmt.js');


module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.get('/users/*', sessionVerificationFunc);

    app.get('/users', function(req, res) {

        congigMgmntDao.getListNew('7', 'loginname', function(err, usersList) {
            if (err) {
                res.status(500).send("Failed to fetch User.");
                return;
            }
            logger.debug('userlist ==> ',usersList);
            if (usersList) {
                res.send(usersList);
                return;
            } else {
                res.send(404);
                return;
            }
        });

    });


};