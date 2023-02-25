const { SlashCommandBuilder } = require('@discordjs/builders');
const Bot = require('../bot');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause player'),
    execute: Bot.getInstance().pause,
};