var expect = require('chai').expect;
var nock = require('nock');
var getLocations = require('../app').getLocations;
let PropertiesReader = require('properties-reader');
let properties = PropertiesReader('./app_properties');

describe('GET location', function() {

  beforeEach(function() {
    var locations = ["347629", "710949", "asdasdasdasdasd"];
    var responseCodes = [200,200,200];
    var locationsResponses = [{
  "Version": 1,
  "Key": "347629",
  "Type": "City",
  "Rank": 35,
  "LocalizedName": "San Francisco",
  "EnglishName": "San Francisco",
  "PrimaryPostalCode": "94103",
  "Region": {
    "ID": "NAM",
    "LocalizedName": "North America",
    "EnglishName": "North America"
  },
  "Country": {
    "ID": "US",
    "LocalizedName": "United States",
    "EnglishName": "United States"
  },
  "AdministrativeArea": {
    "ID": "CA",
    "LocalizedName": "California",
    "EnglishName": "California",
    "Level": 1,
    "LocalizedType": "State",
    "EnglishType": "State",
    "CountryID": "US"
  },
  "TimeZone": {
    "Code": "PST",
    "Name": "America/Los_Angeles",
    "GmtOffset": -8,
    "IsDaylightSaving": false,
    "NextOffsetChange": "2020-03-08T10:00:00Z"
  },
  "GeoPosition": {
    "Latitude": 37.775,
    "Longitude": -122.419,
    "Elevation": {
      "Metric": {
        "Value": 31,
        "Unit": "m",
        "UnitType": 5
      },
      "Imperial": {
        "Value": 101,
        "Unit": "ft",
        "UnitType": 0
      }
    }
  },
  "IsAlias": false,
  "SupplementalAdminAreas": [
    {
      "Level": 2,
      "LocalizedName": "San Francisco",
      "EnglishName": "San Francisco"
    }
  ],
  "DataSets": [
    "AirQualityCurrentConditions",
    "AirQualityForecasts",
    "Alerts",
    "DailyAirQualityForecast",
    "DailyPollenForecast",
    "ForecastConfidence",
    "MinuteCast",
    "Radar"
  ]
},
{
  "Version": 1,
  "Key": "710949",
  "Type": "City",
  "Rank": 85,
  "LocalizedName": "New York",
  "EnglishName": "New York",
  "PrimaryPostalCode": "LN4 4",
  "Region": {
    "ID": "EUR",
    "LocalizedName": "Europe",
    "EnglishName": "Europe"
  },
  "Country": {
    "ID": "GB",
    "LocalizedName": "United Kingdom",
    "EnglishName": "United Kingdom"
  },
  "AdministrativeArea": {
    "ID": "LIN",
    "LocalizedName": "Lincolnshire",
    "EnglishName": "Lincolnshire",
    "Level": 1,
    "LocalizedType": "Non-Metropolitan County",
    "EnglishType": "Non-Metropolitan County",
    "CountryID": "GB"
  },
  "TimeZone": {
    "Code": "GMT",
    "Name": "Europe/London",
    "GmtOffset": 0,
    "IsDaylightSaving": false,
    "NextOffsetChange": "2020-03-29T01:00:00Z"
  },
  "GeoPosition": {
    "Latitude": 53.078,
    "Longitude": -0.137,
    "Elevation": {
      "Metric": {
        "Value": 20,
        "Unit": "m",
        "UnitType": 5
      },
      "Imperial": {
        "Value": 65,
        "Unit": "ft",
        "UnitType": 0
      }
    }
  },
  "IsAlias": false,
  "SupplementalAdminAreas": [
    {
      "Level": 0,
      "LocalizedName": "England",
      "EnglishName": "England"
    },
    {
      "Level": 2,
      "LocalizedName": "East Lindsey",
      "EnglishName": "East Lindsey"
    }
  ],
  "DataSets": [
    "AirQualityCurrentConditions",
    "AirQualityForecasts",
    "Alerts",
    "MinuteCast",
    "Radar"
  ]
}, null];

    // Mock the Locations API request response
for (var i=0; i<locations.length; i++)
{
    nock(properties.get('WEATHER_API_DOMAIN'))
      .get(properties.get('WEATHER_API_LOCATION_URI')+locations[i])
      .query({'apikey': properties.get('WEATHER_API_KEY')})
      .reply(responseCodes[i], locationsResponses[i]);
}

  });

  it('returns Valid Locations', function(done) {

    var request = ["347629", "710949"]

    getLocations(request,function(err, LocationsResponse) {
      expect(LocationsResponse).to.have.length(2);
      expect(LocationsResponse).to.eql([ { LocationName: 'San Francisco', LocationKey: '347629' },
     { LocationName: 'New York', LocationKey: '710949' } ]);
      //expect(LocationsResponse).to.have.length.equal(2);
      done();
    }); 

  });

  it('returns InValid Location error', function(done) {

    var request = ["asdasdasdasdasd"]

    getLocations(request, function(err, LocationsResponse) {
      expect(err).to.have.length(2);
      expect(err[0]).to.have.eql({"error":"Location key provided is invalid.", "locationKey": 'asdasdasdasdasd'});
      expect(err[1]).to.have.equal(400);
      done();
    }); 

  });

  //Further test cases to be written
});