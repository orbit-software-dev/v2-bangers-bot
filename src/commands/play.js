const { SlashCommandBuilder } = require('@discordjs/builders');
const Bot = require('../bot');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Voice channel to join')
        .addStringOption(option2 =>
            option2
                .setName('song')
                .setDescription('Song URL / Name')),
    execute: Bot.getInstance().playSong,
};