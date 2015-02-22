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
        validator: 'matches',
        arguments: regEx,
        message: message
    });
}

var validators = {

    orgIdValidator: [getLengthValidator(1, 100, 'Invalid Org Id'),getRegExValidator(/^[a-zA-Z0-9-_]+$/,'Invalid Org Id')],
    bgIdValidator: [getLengthValidator(1, 100, 'Invalid Business Id '),getRegExValidator(/^[a-zA-Z0-9-_]+$/,'Invalid Business Id')],
    projIdValidator: [getLengthValidator(1, 100, 'Invalid Project Id '),getRegExValidator(/^[a-zA-Z0-9-_]+$/,'Invalid Project Id')],
    envIdValidator: [getLengthValidator(1, 100, 'Invalid Environment Id '),getRegExValidator(/^[a-zA-Z0-9-_]+$/,'Invalid Environment Id')],
    recipeValidator: [getRegExValidator(/^recipe[|role[.*]$/i, "Invalid Runlist format")], // need to investigate further
    catalystUsernameValidator: [getLengthValidator(1, 100, 'Invalid Catalyst Username'),getRegExValidator(/^[a-zA-Z0-9-_]+$/,'Invalid Catalyst Username')],
    blueprintNameValidator : [getLengthValidator(1, 100, 'Invalid Blueprint Name'),getRegExValidator(/^[a-zA-Z0-9-_]+$/,'Invalid Blueprint Name')],

};

module.exports = validators;