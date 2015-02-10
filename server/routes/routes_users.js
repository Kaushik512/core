var congigMgmntDao = require('../model/d4dmasters/configmgmt.js');


module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.get('/users/*', sessionVerificationFunc);

    app.get('/users', function(req, res) {

        congigMgmntDao.getListNew('7', 'loginname', function(err, usersList) {
            if (err) {
                res.send(500);
                return;
            }
            console.log('userlist ==> ',usersList);
            if (usersList) {
                res.send(usersList);
            } else {
                res.send(404);
            }
        });

    });


};