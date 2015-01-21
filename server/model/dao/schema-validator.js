var validate = require('mongoose-validator');


function getLengthValidator(min, max, message) {
    return validate({
        validator: 'isLength',
        arguments: [min, max],
        message: message
    });
}

function getRegExValidator(regEx, message) {
    return validate({
        validator: 'matches'
        arguments: regEx,
        message: message
    });
}

var validators = {

    orgIdValidator: [getLengthValidator(1, 100, 'Invalid Org Id')],
    projIdValidator: [getLengthValidator(1, 100, 'Invalid Project Id ')],
    envIdValidator: [getLengthValidator(1, 100, 'Invalid Environment Id ')],
    recipeValidator: [getRegExValidator(/^recipe[|role[.*]$/i, "Invalid Runlist format")], // need to investigate further
    catalystUsernameValidator: [getLengthValidator(1, 100, 'Invalid Catalyst Username')]

};

module.exports = validators;