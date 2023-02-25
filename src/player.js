const Queue = require("./queue");
const { createAudioResource } = require('@discordjs/voice');
const { getVoiceConnection, AudioPlayerStatus, entersState, joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');
const { join } = require('path');

class Player {

    constructor(options) {
        this.channelId = options.channelId;
        this.guildId = options.guildId;
        this.adapterCreator = options.adapterCreator;
        this.soundsDir = options.soundsDir;
        this.connection = getVoiceConnection(options.guildId);
        this.queue = new Queue();
    }

    getQueue() {
        return this.queue;
    }

    async give(song, disconnectMethod) {
        if (!this.connection) {
            await this.play(song, disconnectMethod);
        } else {
            this.queue.add(song);
            song.download();
        }
    }

    async play(song, disconnectMethod) {
        this.connection = joinVoiceChannel({
            channelId: this.channelId,
            guildId: this.guildId,
            adapterCreator: this.adapterCreator,
            selfDeaf: false,
            selfMute: false,
        });

        this.audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        if (!song.downloaded) {
            await song.download();
        }
        const resource = createAudioResource(join(this.soundsDir, `${song.filename}.wav`));
        resource.volume = 1;

        song.startRemoveTimer(this.soundsDir);
        this.connection.subscribe(this.audioPlayer);
        this.audioPlayer.play(resource);

        await entersState(this.audioPlayer, AudioPlayerStatus.Playing, 5_000);
        this.setAudioPlayerListening(disconnectMethod);
    }

    setAudioPlayerListening(disconnectMethod) {
        this.audioPlayer.on('stateChange', async (oldState, newState) => {
            if (newState.status !== 'idle') {
                return;
            }
            const nextSong = await this.queue.next();
            if (!nextSong) {
                return disconnectMethod();
            }
            await this.play(nextSong, disconnectMethod);
        });
    }

    disconnect() {
        this.connection.destroy();
    }

    deleteQueue(soundsDir) {
        this.queue.delete(soundsDir);
    }

    pause() {
        if (this.connection) {
            this.connection.state.subscription.player.pause();
        }
    }

    resume() {
        if (this.connection) {
            this.connection.state.subscription.player.unpause();
        }
    }

    async skip(disconnectMethod) {
        if (this.connection) {
            const nextSong = this.queue.next();
            if (!nextSong) {
                return disconnectMethod();
            }
            await this.play(nextSong, disconnectMethod);
        }
    }
}

module.exports = Player;