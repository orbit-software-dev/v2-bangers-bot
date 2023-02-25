const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { join } = require('path');
const { readdirSync, existsSync, mkdirSync } = require('fs');
const Player = require('./player');
const Song = require('./song');
const Downloader = require('./downloader');
const ytsr = require('ytsr');
const DB = require('./db');

class Bot {

    constructor() {
        this.COMMAND_DIR = join(__dirname, "commands");
        this.EVENTS_DIR = join(__dirname, "events");
        this.SOUNDS_DIR = join(__dirname, "sounds");
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Bot();
        }
        return this.instance;
    }

    async setup(token) {
        await this.connectToDb();
        this.setupClient();
        this.setupDownloader();
        this.importCommands();
        this.importEvents();
        await this.login(token);
    }

    setupDownloader() {
        if (!existsSync(this.SOUNDS_DIR)) {
            mkdirSync(this.SOUNDS_DIR);
        }
        this.downloader = Downloader.setSoundsDir(this.SOUNDS_DIR);
    }

    setupClient() {
        this.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
        this.client.commands = new Collection();
    }

    importCommands() {
        const commandFiles = this.getJSFilesFromDir(this.COMMAND_DIR);
        for (const file of commandFiles) {
            const command = require(join(this.COMMAND_DIR, file));
            this.client.commands.set(command.data.name, command);
        }
    }

    importEvents() {
        const eventFiles = this.getJSFilesFromDir(this.EVENTS_DIR);
        for (const file of eventFiles) {
            const event = require(join(this.EVENTS_DIR, file));
            if (event.once) {
                this.client.once(event.name, (...args) => event.execute(...args));
            } else {
                this.client.on(event.name, (...args) => event.execute(...args));
            }
        }
    }

    async login(token) {
        await this.client.login(token);
    }

    getJSFilesFromDir(dir) {
        return readdirSync(dir).filter((file) => file.endsWith('.js'));
    }

    async playSong(interaction) {
        await interaction.reply(`Command Recieved...`);
        const channel = interaction.member.voice.channel;
        if (!channel) {
            return await interaction.editReply(`User must be in a voice channel...`);
        }

        if (!Bot.getInstance().player) {
            Bot.getInstance().player = new Player({
                channelId: channel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                soundsDir: Bot.getInstance().SOUNDS_DIR,
            });
        }

        const songInput = interaction.options.get('song').value;
        let song;
        if (songInput.includes('https://')) {
            song = new Song(songInput);
        } else {
            let searchString = interaction.options.get('song').value.trim();
            if (!searchString.includes('lyrics')) {
                searchString += ' lyrics';
            }
            const searchResults = await ytsr(searchString, {
                limit: 1
            });
            song = new Song(searchResults.items[0].url);
        }
        await song.setupSong();
        await Bot.getInstance().player.give(song, Bot.getInstance().disconnect);
        await interaction.editReply(`Playing song: ${song.title}`);
    }

    async shuffleQueue(interaction) {
        await interaction.reply("Shuffling Queue...");
        Bot.getInstance().player.getQueue().shuffle();
    }

    async getQueue(interaction) {
        const emptyQueueString = `Queue Empty`;
        if (!Bot.getInstance().player) {
            return await interaction.reply(emptyQueueString);
        }
        const queue = Bot.getInstance().player.getQueue().get();
        if (queue.length === 0) {
            await interaction.reply(emptyQueueString);
        } else {
            let response = `Song Queue:\n`;
            for (let i = 0; i < queue.length; i++) {
                response += `${i + 1} - ${queue[i].title}\n`;
            }
            await interaction.reply(response);
        }
    }

    async disconnectCmd(interaction) {
        await interaction.reply("Bye bye! 👋");
        Bot.getInstance().disconnect();
    }

    async connectToDb() {
        await DB.getInstance().connect();
    }

    disconnect() {
        if (Bot.getInstance().player) {
            Bot.getInstance().player.disconnect();
            Bot.getInstance().player.deleteQueue(Bot.getInstance().SOUNDS_DIR);
            Bot.getInstance().player = null;
        }
    }

    async pause(interaction) {
        await interaction.reply('Pausing...');
        Bot.getInstance().player.pause();
    }

    async resume(interaction) {
        await interaction.reply('Resuming...');
        Bot.getInstance().player.resume();
    }

    async skip(interaction) {
        await interaction.reply('Skipping...');
        await Bot.getInstance().player.skip(Bot.getInstance().disconnect);
    }

}

module.exports = Bot;
