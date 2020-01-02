const fs = require('fs');
let PropertiesReader = require('properties-reader');
let properties = PropertiesReader('./app_properties');
const FILE_PATH = properties.get('FILE_PATH');

class Location {

		constructor(locationKeys, locationsResponse) {
		this.locationKeys = locationKeys;
		this.locationNames = locationsResponse;
		if (locationKeys) {
			this.status = 'ADDED';
		} else {
			this.status = ''; 
		}
	}
}

let setLocationObject = function(locationKeys, locationsResponse, locationObject) {

	let locationObj = new Location(locationKeys, locationsResponse);
  	fs.writeFileSync(FILE_PATH, JSON.stringify(locationObj, null, 2), 'utf-8');
  	locationObject(null, locationObj);
}

let getLocationObject = function(locationObject) {
	let data;

	try {
		fs.access(FILE_PATH, (locationObject, err)=> {
			if (err) locationObject(null, new Location([],[]));
		});
		data = fs.readFileSync(FILE_PATH, 'utf-8');
		locationObject(null, Object.assign(new Location, JSON.parse(data)));
	} catch (err) {
		locationObject([{"error":"Integrations don't exist."},500]);
	}
}

module.exports = Location;
module.exports.setLocationObject = setLocationObject;
module.exports.getLocationObject = getLocationObject;