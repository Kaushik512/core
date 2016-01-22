/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var util = require('util');
var utils = {
    arrayMerge: function(array1, array2) {

        var a = array1.concat(array2);
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
        return a;
    },
    mergeObjects: function(objectsArray) {

        var attributeObj = {};
        var currentObj;

        function mergeObj(currentObj, obj) {
            var keys = Object.keys(obj);
            for (var j = 0; j < keys.length; j++) {
                if (!currentObj[keys[j]]) {
                    currentObj[keys[j]] = {};
                }
                if (typeof obj[keys[j]] === 'object' && !util.isArray(obj[keys[j]])) {
                    mergeObj(currentObj[keys[j]], obj[keys[j]]);
                } else {
                    currentObj[keys[j]] = obj[keys[j]];
                }
            }
        }
        for (var i = 0; i < objectsArray.length; i++) {
            currentObj = attributeObj;
            mergeObj(currentObj, objectsArray[i]);
            attributeObj = currentObj;
        }
        return attributeObj;

    }

};


module.exports = utils;