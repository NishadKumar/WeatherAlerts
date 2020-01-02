'use strict'
const Location = require('./location');
var setLocationObject = require('./location').setLocationObject;
var getLocationObject = require('./location').getLocationObject;

let express = require('express');

let app = express();
app.use(express.json());


let rp = require('promise-request-retry');
let PropertiesReader = require('properties-reader');
let properties = PropertiesReader('./app_properties');
let locationObject;

//POST API to add integration. User sends in a list of location keys whose weather current conditions are sent as alerts to BigPanda
app.post('/location', async function(req, res) {
	
	try {
		getLocations(req.body.locations, function(err, locationsResponse) {
		      if (err) {
		      	res.status(err[1]);
		      	res.json(err[0]);
		      }
		      else {
		      	setLocationObject(req.body.locations, locationsResponse, function(err, locationResponseObject) {
		      		locationObject = locationResponseObject;
		      	});
		      	res.status(201);
		      	res.json(locationObject);
		      }
	    });
	} catch (e) {
		res.status(500);
		res.json("Internal error.");
	}	 
});

//GET API
app.get('/location', async function(req, res) {

	getLocationObject(function(err, locationResponseObject) {
		if (err) {
			res.status(err[1]);
			res.json(err[0]);
		} else {
			locationObject = locationResponseObject;	
			res.status(200);
			res.json(locationObject);
		}
	});
	
});

//fetches official location name for each location key provided in the user input
async function getWeather(location) {

	let API_KEY = properties.get('WEATHER_API_KEY');
	let WEATHER_LOCATION_API_URI = properties.get('WEATHER_LOCATION_API_URI');

	var options = {
    	    uri: WEATHER_LOCATION_API_URI + location,
    	    qs: {
            apikey: API_KEY
        },
        json: true,
  		transform: _include_headers,
  		resolveWithFullResponse: true,
  		retry: 3,
  		factor: 2,
  		delay: 2000,
  		accepted: [200]
	};
	
	return new Promise(async (resolve, reject) => {
		await rp(options).then(function(response) {
		if (response["data"] !== null) {
			resolve({"LocationName": response["data"]["EnglishName"], "LocationKey": location});
		} else {
			reject([{"error":"Location key provided is invalid.", "locationKey": location}, 400]);
		}
	}).catch(function (err) {
		reject([{"error":err.error.Message, "locationKey": location}, 500]);
		});
	});
}

var getLocations = function(locations, callback) {
	if (locations.length === 0) {
		callback([{"error":"Location keys not provided.", "locationKey": locations}, 400]);
		return;
	}
	let promises = locations.map((location) => {
		return getWeather(location);
	});
	Promise.all(promises).then(response => {
		callback(null, response);
		return response; 
	})
	.catch(error => {
		callback(error);
		return error;
	});		
};


var _include_headers = function(body, response, resolveWithFullResponse) {
  return {'headers': response.headers, 'data': body, 'statusCode':response.statusCode};
};


module.exports.getLocations = getLocations;

app.listen(properties.get('APP_SERVER_PORT'))