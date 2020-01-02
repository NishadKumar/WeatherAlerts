const fs = require('fs');
let cron = require('node-cron');
let rp = require('promise-request-retry');
let PropertiesReader = require('properties-reader');
let properties = PropertiesReader('./app_properties');
const FILE_PATH = properties.get('FILE_PATH');


//Cron job which acts as a scheduler to lookup the in-memory file every minute to keep pushing alerts to BigPanda. Configurable as per the needs 
cron.schedule('* * * * *', async () => {
	try {
		console.log("Running the job every minute..");
		let data, promises;
  		data = JSON.parse(fs.readFileSync(FILE_PATH,'utf-8'));
  		promises = await pullWeatherConditions(data);

  		Promise.all(promises).then(function (currentConditions) {
  			pushAlertsToBigPanda(currentConditions, data);
  		}).catch(function (error) {
  			console.log("Error in getting current weather conditions ", error);
  		});
	} catch(err) {
		console.log("No data in file yet.");
	}
});

//Fetches current eeather conditions for all location keys provided as input by the user
async function pullWeatherConditions(data) {
	
	let locations = data["locationNames"];

	return locations.map((location) => {
		return getCurrentWeatherCondition(location["LocationKey"]);
	});
}

//Fetches current weather conditions from AccuWeather API for every locationkey
async function getCurrentWeatherCondition(location) {

	console.log("location = ", location);

	let API_KEY = properties.get('WEATHER_API_KEY');
	let WEATHER_CURRENT_CONDITIONS_API_URI = properties.get('WEATHER_CURRENT_CONDITIONS_API_URI');

	var options = {
    	    uri: WEATHER_CURRENT_CONDITIONS_API_URI + location,
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

	return new Promise(async(resolve, reject) => {
		await rp(options).then(function(response) {
			resolve(response["data"][0]);
		}).catch(function(err) {
			console.log("Promise error");
			reject(err);
		})
	});
}


//pushes alerts to BigPanda 
async function pushAlertsToBigPanda(currentConditions, data) {

	let BIG_PANDA_API_KEY = properties.get('BIG_PANDA_API_KEY');
	let BIG_PANDA_ALERTS_API_URI = properties.get('BIG_PANDA_ALERTS_API_URI');

	let requestPayload = {"app_key":BIG_PANDA_API_KEY,"alerts":[]};
	
	for(var i = 0; i < currentConditions.length; i++) {
		let alertBody = {"status":"","description":"","link":"","locationkey":"","primary_property":"locationkey"};
		let temperature = currentConditions[i]["Temperature"]["Metric"]["Value"];
		if ( temperature > 10 && temperature <=20 ) {
			alertBody["status"] = "warning";
			alertBody["description"] = "WARNING: Temperature between 10 and 20 degree celcius."
		} else if (temperature <=10 ) {
			alertBody["status"] = "critical";
			alertBody["description"] = "CRITICAL: Temperature below 10 degree celcius."
		} else {
			alertBody["status"] = "ok";
			alertBody["description"] = "OK: Temperature above 20 degree celcius."
		}
		alertBody["link"] = currentConditions[i]["Link"];
		alertBody["locationkey"] = data["locationNames"][i]["LocationKey"];
		requestPayload["alerts"].push(alertBody);
	}
	
	let BIG_PANDA_AUTH = properties.get('BIG_PANDA_AUTH');

	//Request Promise retry module to handle retry logic(3 attempts)
	let options = {
    	    method: 'POST',
    	    uri: BIG_PANDA_ALERTS_API_URI,
    	    body: requestPayload,
    	    headers: {
    	    	"Authorization": BIG_PANDA_AUTH,
    	    	"Content-Type": "application/json"
    	    },
        	json: true,
  			transform: _include_headers,
  			resolveWithFullResponse: true,
  			retry: 3,
  			factor: 2,
  			delay: 2000,
  			accepted: [200]
		};

	await rp(options).then(function(response) {
		console.log("POST API for BigPanda Response ", response);
	}).catch(function(err) {
		console.log("POST API BigPanda Error ", err);
	});

}


var _include_headers = function(body, response, resolveWithFullResponse) {
  return {'headers': response.headers, 'data': body, 'statusCode':response.statusCode};
};
