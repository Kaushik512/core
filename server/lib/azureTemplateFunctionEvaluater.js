var pad = require('node-string-pad');
var farmhash = require('farmhash');
var url = require('url');


function isExpression(expression) {
	if (typeof expression === 'string') {
		var indexOfOpenBracket = expression.indexOf('[');
		if (indexOfOpenBracket === 0) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

function refactorExpression(expression) {
	if (typeof expression === 'string') {
		var indexOfOpenBracket = expression.indexOf('[');
		if (indexOfOpenBracket === 0) {
			var newExpression = expression.substring(indexOfOpenBracket + 1, expression.length - 1);
			return newExpression;
		} else {
			return expression;
		}
	} else {
		return expression;
	}

}

function scope(expression, params, variab, index) {

	// numneric expression

	function add(operand1, operand2) {
		return operand1 + operand2;
	}

	function copyIndex() {
		if (index) {
			return index;
		} else {
			return 0;
		}

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
		if (!startIndex) {
			startIndex = 0;
		}
		if (length) {
			return stringToParse.substr(startIndex, length);
		} else {
			return stringToParse.substr(startIndex);
		}
	}

	function toLower(stringToChange) {
		return stringToChange.toLowerCase();
	}

	function toUpper(stringToChange) {
		return stringToChange.toUpperCase();
	}

	function trim(stringToTrim) {
		return stringToTrim.trim();
	}

	function uniqueString() {
		var str = '';
		for (var i = 0; i < arguments.length; i++) {
			str = str + arguments[i];
		}
		var hash = farmhash.hash64(str);
		return hash;

	}

	function uri(baseUri, relativeUri) {
		return url.resolve(baseUri, relativeUri);
	}



	function parameters(key) {
		if (params[key]) {
			return params[key].value;
		}
	}

	function variables(key) {
		var value = variab[key];
		if (typeof value === 'string') {
			var indexOfOpenBracket = value.indexOf('[');
			if (indexOfOpenBracket ===  0) {
				var newExpression = value.substring(indexOfOpenBracket + 1, value.length - 1);
				return scope(newExpression, params, variab, index);
			} else {
				return value;
			}
		} else {
			return value;
		}

	}



	return eval(expression);

}

module.exports.evaluate = function(expression, parameters, variables, index) {
	console.log('params ===>',parameters);
	if (isExpression(expression)) {
		expression = refactorExpression(expression);
		return scope(expression, parameters, variables, index);
	} else {
		console.log('not a expression');
		return expression;
	}

};