const Discord = require('discord.js-commando');
const Discord2 = require('discord.js');
require('./data-retrieving')();

var champData = null;

class SummonerCommand extends Discord.Command {

	constructor(client) {

		super(client, {

			name: 'summoner',
			group: 'commands',
			memberName: 'summoner',
			description: 'Returns information of the summoner',
			examples: ['summoner ItzCynical'],
			args: [
				{

					key : 'summonerName',
					prompt : 'Enter Summoner Name',
					type : 'string'
				}
			]
		});
	}

	async run(message, { summonerName }) {

		try {

			// Call Riot API and get relevant information

			var summonerData = await getSummonerData(summonerName);
			var patchData = await getPatchData();
			var rankedData = await getRankedData(summonerData.id);
			var matchData = await getMatchData(summonerData.accountId, 0);
			
			if(champData == null) {
				champData = await getChampDataAll(patchData[0]);
			}

			var iconURL = "http://ddragon.leagueoflegends.com/cdn/" + patchData[0] + "/img/profileicon/" + summonerData.profileIconId + ".png";
			var rankQueues = ['N/A','N/A','N/A'];

			// Get summoner rank and winrates in all rank queues

			for(var i = 0; i < rankedData.length; i++) {

				var queueType = rankedData[i].queueType;
				var tier = rankedData[i].tier;
				var rank = rankedData[i].rank;
				var winRate = Math.round((rankedData[i].wins/(rankedData[i].wins + rankedData[i].losses)) * 1000)/10;

				if(queueType == 'RANKED_SOLO_5x5') {

					rankQueues[0] = tier + rank + ' ' + winRate.toString() + '%';
				}
				else if(queueType == 'RANKED_FLEX_SR') {

					rankQueues[1] = tier + rank + ' ' + winRate.toString() + '%';
				}
				else{

					rankQueues[2] = tier + rank + ' ' + winRate.toString() + '%';
				}
			}

			// traverse through match data and store champ data in hashmap

			var champMap = new Map();
			var recentChampMap = new Map();
			var topPlayed = ['', '', ''];
			var recentPlayed = ['', '', ''];
			var index = 0;

			for(var i = 0; i < matchData.matches.length; i++) {

				var champId = matchData.matches[i].champion.toString();

				if(champMap.has(champId)) {

					champMap.set(champId, champMap.get(champId) + 1);
				}
				else {

					champMap.set(champId, 1);
				}

				if(i < 20 && index == 0) {
					if(recentChampMap.has(champId)) {

						recentChampMap.set(champId, recentChampMap.get(champId) + 1);
					}
					else {

						recentChampMap.set(champId, 1);
					}
				}

				// Riot api only allows 100 entries per call. If number of matches exceed 100 make another request

				if(i == 99) {

					index = index + 100;
					i = 0
					matchData = await getMatchData(summonerData.accountId, index);
				}
			}

			var it = champMap.keys();
			var it2 = champMap.keys();

			// Get id of top 3 most played and recent champs. Recent champs are limited to the 20 most recent games.

			while(!it.next().done) {

				var champId = it2.next().value;
				var count = champMap.get(champId);

				if(topPlayed[0] == '' || count > champMap.get(topPlayed[0])) {

					topPlayed[2] = topPlayed[1];
					topPlayed[1] = topPlayed[0]
					topPlayed[0] = champId;
					
				}
				else if(topPlayed[1] == '' || count > champMap.get(topPlayed[1])) {

					topPlayed[2] = topPlayed[1];
					topPlayed[1] = champId;
				}
				else if(topPlayed[2] == '' || count > champMap.get(topPlayed[2])) {

					topPlayed[2] = champId;
				}
			}

			var it = recentChampMap.keys();
			var it2 = recentChampMap.keys();

			while(!it.next().done) {

				var champId = it2.next().value;
				var count = recentChampMap.get(champId);

				if(recentPlayed[0] == '' || count > recentChampMap.get(recentPlayed[0])) {

					recentPlayed[2] = recentPlayed[1];
					recentPlayed[1] = recentPlayed[0]
					recentPlayed[0] = champId;
				}
				else if(recentPlayed[1] == '' || count > recentChampMap.get(recentPlayed[1])) {

					recentPlayed[2] = recentPlayed[1];
					recentPlayed[1] = champId;
				}
				else if(recentPlayed[2] == '' || count > recentChampMap.get(recentPlayed[2])) {

					recentPlayed[2] = champId;
				}
			}

			// Get champ name coressponding to stored id. The champ information is stored locally for now.

			topPlayed[0] = getChampData(topPlayed[0], champData);
			topPlayed[1] = getChampData(topPlayed[1], champData);
			topPlayed[2] = getChampData(topPlayed[2], champData);

			recentPlayed[0] = getChampData(recentPlayed[0], champData);
			recentPlayed[1] = getChampData(recentPlayed[1], champData);
			recentPlayed[2] = getChampData(recentPlayed[2], champData);

			// Send an embed with information attatched.

			const embed = new Discord2.RichEmbed()
				.setAuthor(summonerData.name, iconURL)
				.addField('Level', summonerData.summonerLevel)
				.addField('Solo/Duo: ', rankQueues[0])
				.addField('Ranked Flex 5v5: ', rankQueues[1])
				.addField('Ranked Flex 3v3: ', rankQueues[2])
				.addField('Most Played: ', topPlayed[0] + ' ' + topPlayed[1] + ' ' + topPlayed[2])
				.addField('Recently Played: ', recentPlayed[0] + ' ' + recentPlayed[1] + ' ' + recentPlayed[2])
				.setThumbnail(iconURL);

			return message.embed(embed);
		}
		catch(err) {

			console.log(err);
		}
	}
}

module.exports = SummonerCommand;