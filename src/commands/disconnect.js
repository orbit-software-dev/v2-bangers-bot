const { SlashCommandBuilder } = require('@discordjs/builders');
const Bot = require('../bot');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnects music bot'),
    execute: Bot.getInstance().disconnectCmd,
};