const { SlashCommandBuilder } = require('@discordjs/builders');
const Bot = require('../bot');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Get song queue'),
    execute: Bot.getInstance().getQueue,
};