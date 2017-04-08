var Promise = require('bluebird');

/**
 * Validate data according to schema for
 * an insert request
 * @param  {[type]} schema [description]
 * @param  {[type]} data   [description]
 * @return {[type]}        [description]
 */
module.exports.vcfToObject = function(data) {
    return parseChunksToProperties(parseLinesToPropertiesChunks(evalProperties(stripUnixChars(data))));
};

function stripUnixChars(str) {
    return str.replace(/\r/g, "").split(/\n/g);
}

function evalProperties(cardLines) {
    let validLines = [];
    let validLinesIndex = -1;

    for (let cardLine of cardLines) {
        var isValidProperty = evalTextLine(cardLine);

        if (isValidProperty) {
            validLinesIndex++;
            validLines[validLinesIndex] = cardLine;
        } else {
            validLines[validLinesIndex] += cardLine;
        }
    }

    return validLines;
}

function evalTextLine(textLine) {
    var hasPropertyElement = textLine.match(/[A-Z]*:/);
    return hasPropertyElement && hasPropertyElement.constructor.name == "Array";    
}

function parseLinesToPropertiesChunks(propertyLines) {
    var properties = [];

    for (let propertyLine of propertyLines) {
        properties.push(parsePropertyChunks(propertyLine));
    }

    return properties;
}

function parsePropertyChunks(propertyLine) {
    var arr = propertyLine.split(":");
    var chunks = [];
    chunks[0] = arr[0] || "";
    chunks[1] = "";
    for (var i = 1; i < arr.length; i++) {
        chunks[1] += (":" + arr[i]);
    }
    chunks[1] = chunks[1].substr(1);

    return chunks;
}

function parseChunksToProperties(propertiesChunks) {
    var numPropertiesChunks = propertiesChunks.length;
    var properties = {};
    for (var i = 0; i < numPropertiesChunks; i++) {
        var property = parsePropertyChunksToObject(propertiesChunks[i]);

        if (properties[property.name]) {
            switch (properties[property.name].constructor.name) {
                case "Object":
                    properties[property.name] = [
                        properties[property.name],
                        property.value
                    ]
                    break;
                case "Array":
                    properties[property.name].push(property.value);
                    break;
            }
        } else {
            switch (property.name) {
                default: properties[property.name] = property.value;
                break;
                case "tel":
                case "email":
                case "impp":
                case "url":
                case "adr":
                case "x-socialprofile":
                case "x-addressbookserver-member":
                case "member":
                    properties[property.name] = [property.value];
                break;
                case "begin":
                case "prodid":
                case "end":
                case "version":
                break;
                case "n":
                    properties['name'] = property.value;
                case "org":
                    properties['organization'] = property.value;
                break;
            }
        }
    }

    return properties;
}

function parsePropertyChunksToObject(propertyChunks) {

    var obj = {}

    var leftPart = propertyChunks[0];
    var rightPart = propertyChunks[1];

    var leftPartPieces = leftPart.split(";");
    var numLeftPartPieces = leftPartPieces.length;

    var propTypes = [];

    for (var i = 1; i < numLeftPartPieces; i++) {
        if (leftPartPieces[i].substr(0, 5).toUpperCase() == "TYPE=") {
            propTypes.push(leftPartPieces[i].substr(5).toLowerCase());
        }
    }

    obj.name = leftPartPieces[0].replace(/(item|ITEM)[0-9]./, "").toLowerCase();

    switch (obj.name) {
        case "n":
            obj.value = parseName(rightPart);
            obj.test = 'boe';
            break;
        case "adr":
            obj.value = parseAddress(rightPart, propTypes);
            break;
        case "tel":
        case "email":
        case "impp":
        case "url":
            obj.value = parseMVProperty(rightPart, propTypes);
            break;
        case "org":
            obj.value = parseOrganization(rightPart);
            break;
        default:
            obj.value = rightPart
            break;
    }
    return obj;
}

function parseMVProperty(mvValue, types) {
    return {
        type: types,
        value: mvValue
    }
}

function parseAddress(adrValues, types) {
    var addressValues = adrValues.split(";", 7);
    var address = {
        street: addressValues[0] + addressValues[1] + addressValues[2],
        city: addressValues[3],
        region: addressValues[4],
        zip: addressValues[5],
        country: addressValues[6],
    }
    return {
        type: types,
        value: address
    };
}

function parseName(nameValues) {
    var nameValues = nameValues.split(";", 5);
    return {
        last: nameValues[0],
        first: nameValues[1],
        middle: nameValues[2],
        prefix: nameValues[3],
        suffix: nameValues[4]
    }
}

function parseOrganization(orgValues) {
    var orgValues = orgValues.split(";", 2);
    return {
        name: orgValues[0],
        dept: orgValues[1]
    }
}