var ChefClientExecution = require('../model/classes/instance/chefClientExecution/chefClientExecution.js');
var errorResponses = require('./error_responses');


module.exports.setRoutes = function(app) {
    app.post('/chefClientExecution/:executionId', function(req, res) {
        //  logger.debug(' chef exec id -==>',req.params.executionId);
        // logger.debug(' chef exec -==>',req.body);
        ChefClientExecution.getExecutionById(req.params.executionId, function(err, chefClientExecution) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if(chefClientExecution) {
            	chefClientExecution.update(req.body.message,req.body.jsonAttribute,function(err,data){
                    if(err) {
                    	res.send(500,errorResponses.db.error);
                    	return;
                    }
                    res.send(200,{
                    	message:"Updated"
                    });
            	});
            } else {
            	res.send(404,{
            		message:"Execution id does not exist"
            	});
            }
        });
    });

    app.get('/chefClientExecution/:executionId', function(req, res) {

        ChefClientExecution.getExecutionById(req.params.executionId, function(err, chefClientExecution) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if(chefClientExecution) {
                res.send(chefClientExecution);
            } else {
                res.send(404,{
                    message:"Execution id does not exist"
                });
            }
        });
    });
};