const fs = require('fs');
const request = require('request');

const keyJson = fs.readFileSync('key.json');
const key = JSON.parse(keyJson);

module.exports = function() {

	// Request for summoner data using SUMMONER-V3

	this.getSummonerData = function(summonerName) {

		return new Promise(function(resolve, reject) {

			var noSpaceName = summonerName.replace(/\s/g,'');
			var URL = "https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/" + noSpaceName + "?api_key=" + key.apiKey;
			request(URL, function(err, response, body) {
				if(!err) {

					resolve(JSON.parse(body));
				}
				else {

					reject(err);
				}
			});
		});
	};

	// Request for patch data using LOL-STATIC-DATA-V3

	this.getPatchData = function() {

		return new Promise(function(resolve, reject) {

			var URL = "https://ddragon.leagueoflegends.com/api/versions.json";
			request(URL, function(err, response, body) {
				if(!err) {

					resolve(JSON.parse(body));
				}
				else {

					reject(err);
				}
			});
		});
	};

	// Request for ranked data using LEAGUE-V3

	this.getRankedData = function(summonerId) {

		return new Promise(function(resolve, reject) {

			var URL = "https://na1.api.riotgames.com/lol/league/v3/positions/by-summoner/" + summonerId + "?api_key=" + key.apiKey;
			request(URL, function(err, response, body) {
				if(!err) {

					resolve(JSON.parse(body));
				}
				else {

					reject(err);
				}
			});
		});
	}

	// Request for match data using MATCH-V3

	this.getMatchData = function(accountId, beginIndex) {

		return new Promise(function(resolve, reject) {

			var URL = "https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/" + accountId + "?beginIndex=" + beginIndex + "&queue=420&queue=440&season=11&api_key=" + key.apiKey;
			request(URL, function(err, response, body) {
				if(!err) {

					resolve(JSON.parse(body));
				}
				else {

					reject(err);
				}
			});
		});
	};

	// Request for champion data using CHAMPION-V3
	// static-data V3 Deprecated

	/*this.getChampData = function(championId) {

		return new Promise(function(resolve, reject) {

			var URL = "https://na1.api.riotgames.com/lol/static-data/v3/champions/" + championId + "?locale=en_US&api_key=" + key.apiKey;
			request(URL, function(err, response, body) {
				if(!err) {

					resolve(JSON.parse(body));
				}
				else {

					reject(err);
				}
			});
		});
	};*/

	// Get all champ data from data dragon champion.json

	this.getChampDataAll = function(patchVersion) {
		return new Promise(function(resolve, reject) {

			var URL = "http://ddragon.leagueoflegends.com/cdn/" + patchVersion + "/data/en_US/champion.json";
			console.log(URL);

			request(URL, function(err, response, body) {
				if(!err) {

					resolve(JSON.parse(body));
				}
				else {

					reject(err);
				}
			});
		});
	}

	// Go through list of champ to find name of the champ the id maps to. Might be a better way to do this.

	this.getChampData = function(championId, champList) {

		for(var id in champList.data) {
			if(champList.data[id].key == championId) {
				return id;
			} 
		}

		return "";
	}

	// Get Champ data from local JSON

	this.getChampDataLocal = function(championId) {

		const champJson = fs.readFileSync('champions.json');
		var champList = JSON.parse(champJson);
		var name = '';

		for(var key in champList.data) {

			if(champList.data[key].id.toString() == championId) {

				name = champList.data[key].name;
				break;
			}
		}

		return name;
	};
}