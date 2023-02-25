const { SlashCommandBuilder } = require('@discordjs/builders');
const Bot = require('../bot');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume player'),
    execute: Bot.getInstance().resume,
};