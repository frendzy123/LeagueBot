const Discord = require('discord.js-commando');
const fs = require('fs');
const request = require('request');
const path = require('path');

const keyJson = fs.readFileSync('key.json');
const key = JSON.parse(keyJson);

const bot = new Discord.Client({

	commandPrefix: '!'
});

bot.registry.registerGroup('commands', 'Commands');
bot.registry.registerDefaults();
bot.registry.registerCommandsIn(path.join(__dirname, "commands"));


bot.on('ready', () => {

	console.log('League Bot Logged In.');
})

bot.login(key.key);