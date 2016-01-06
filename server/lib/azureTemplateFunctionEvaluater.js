var pad = require('node-string-pad');


function refactorExpression(expression) {
	if (typeof expression === 'string ') {
		var indexOfOpenBracket = expression.indexOf('[');
		if (indexOfOpenBracket === = 0) {
			var newExpression = expression.substring(indexOfOpenBracket + 1, expression.length - 1);
			return newExpression;
		} else {
			return expression;
		}
	} else {
		return expression;
	}

}

function scope(expression, params, variab) {

	// numneric expression

	function add(operand1, operand2) {
		return operand1 + operand2;
	}

	function copyIndex() {

	}

	function div(operand1, operand2) {
		return operand1 / operand2;
	}

	function int(valueToConvert) {
		if (typeof valueToConvert === 'string') {
			return parseInt(valueToConvert);
		}
		return valueToConvert;
	}

	function length(val) {
		return val.length;
	}

	function mod(operand1, operand2) {
		return operand1 % operand2;
	}

	function mul(operand1, operand2) {
		return operand1 * operand2;
	}

	function sub(operand1, operand2) {
		return operand1 - operand2;
	}

	//String expressions

	function base64(inputString) {
		return (new Buffer(inputString).toString('base64'));
	}

	function concat() {
		var str = '';
		for (var i = 0; i < arguments.length; i++) {
			str = str + arguments[i];
		}
		return str;
	}

	function padLeft(stringToPad, totalLength, paddingCharacter) {
		return pad(stringToPad, totalLength, 'LEFT', paddingCharacter);
	}

	function replace(originalString, oldCharacter, newCharacter) {
		var find = oldCharacter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		return originalString.replace(new RegExp(find, 'g'), newCharacter);
	}

	function split(inputString, delimiter) {
		return inputString.split(delimiter);
	}

	function string(valueToConvert) {
		return '' + valueToConvert;
	}

	function substring(stringToParse, startIndex, length) {

	}

	function toLower() {

	}

	function toUpper() {

	}

	function trim() {

	}

	function uniqueString() {

	}

	function uri() {

	}



	function parameters(key) {
		if (params[key]) {
			return params[key].value;
		}
	}

	function variables(key) {
		var value = variab[key];
		if (typeof value === 'string ') {
			var indexOfOpenBracket = value.indexOf('[');
			if (indexOfOpenBracket === = 0) {
				var newExpression = value.substring(indexOfOpenBracket + 1, value.length - 1);
				return scope(newExpression, params, variab);
			} else {
				return value;
			}
		} else {
			return value;
		}

	}



	return eval(expression);

}

module.exports = function(expression, parameters, variables) {
	expression = refactorExpression(expression);
	return scope(expression, parameters, variables);

};