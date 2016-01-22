/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * July 2015
 */

var logger = require('_pr/logger')(module);
var bcrypt = require('bcryptjs');

// This file act as a Util class which contains methods to hash password and authentication logic.

var AuthUtil = function(){
	// Generating encrypted password using bcrypt 
    this.hashPassword = function(aPassword,callback){
        bcrypt.genSalt(10,function(err,salt){
            if(err){
                logger.debug("Error while Generating Salt.")
                callback(err,null);
            }
            bcrypt.hash(aPassword,salt,function(err,hashedPassword){
                if(err){
                    logger.debug("Errot while hashing password.");
                    callback(err,null);
                }
                callback(null,hashedPassword);
            });
        });
    }

    // Compare password with hashed password
    this.checkPassword = function(password,hashedPassword,callback){
    	logger.debug("password: ",password,hashedPassword);
        bcrypt.compare(password,hashedPassword,function(err,isMatched){
            if(err){
                logger.debug("Something wrong while matching password.");
                callback(err,null);
            }
            logger.debug("isMatched: ",isMatched);
            callback(null,isMatched);
        })
    };
}

module.exports = new AuthUtil();