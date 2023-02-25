const { SlashCommandBuilder } = require('@discordjs/builders');
const Bot = require('../bot');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip current song'),
    execute: Bot.getInstance().skip,
};