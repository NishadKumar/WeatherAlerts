# WeatherAlerts-BigPanda
To build an integration to request the current weather conditions from AccuWeather and push the details as “alerts” into BigPanda

#files below compose my project
1) tasks.sh - > shell script that starts a cron job and the applicaiton itself
2) app.js -> application file that has API endpoints to POST, GET  http://localhost:<PORT_NUMBER>/location
3) app_properties -> All configurable key values like SERVER_PORT, API_KEYS, API_URI etc
4) scheduler.js -> cron job to push alerts BigPanda every minute(can be configured to increase frequency to avoid rate limits)
5) location.js -> Class file for OOP
6) test/app.spec.js -> test framework built by mocking using nock


Git clone the master branch on your local system
Run npm install 

Change directory to the nishad-app folder.
Make the script(cron job) executable with command chmod +x tasks.sh
Run the file ./tasks.sh

The POST API endpoint for example looks like: 
http://localhost:5000/location

Sample Payload:
{
	"locations":["348308", "2249562"]
}

Response:
{
    "locationKeys": [
        "348308",
        "2249562"
    ],
    "locationNames": [
        {
            "LocationName": "Chicago",
            "LocationKey": "348308"
        },
        {
            "LocationName": "Chicago",
            "LocationKey": "2249562"
        }
    ],
    "status": "ADDED"
}

The GET API endpoint:
http://localhost:5000/location

{
    "locationKeys": [
        "348308",
        "2249562"
    ],
    "locationNames": [
        {
            "LocationName": "Chicago",
            "LocationKey": "348308"
        },
        {
            "LocationName": "Chicago",
            "LocationKey": "2249562"
        }
    ],
    "status": "ADDED"
}

Alerts should be visible on the BigPanda dashboard once user adds a list of all configurable location keys. 
