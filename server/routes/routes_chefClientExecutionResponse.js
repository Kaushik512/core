/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

// This file act as a Controller which contains chef-client execution related all end points.


var ChefClientExecution = require('../model/classes/instance/chefClientExecution/chefClientExecution.js');
var errorResponses = require('./error_responses');


module.exports.setRoutes = function(app) {
    app.post('/chefClientExecution/:executionId', function(req, res) {
        ChefClientExecution.getExecutionById(req.params.executionId, function(err, chefClientExecution) {
            if (err) {
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (chefClientExecution) {
                chefClientExecution.update(req.body.message, req.body.jsonAttribute, function(err, data) {
                    if (err) {
                        res.status(500).send(errorResponses.db.error);
                        return;
                    }
                    res.send(200, {
                        message: "Updated"
                    });
                });
            } else {
                res.send(404, {
                    message: "Execution id does not exist"
                });
            }
        });
    });

    app.get('/chefClientExecution/:executionId', function(req, res) {

        ChefClientExecution.getExecutionById(req.params.executionId, function(err, chefClientExecution) {
            if (err) {
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (chefClientExecution) {
                res.send(chefClientExecution);
            } else {
                res.send(404, {
                    message: "Execution id does not exist"
                });
            }
        });
    });
};
