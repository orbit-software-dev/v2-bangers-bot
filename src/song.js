const Downloader = require('./downloader');
const { rmSync, existsSync } = require('fs');
const { join } = require('path');

class Song {
    constructor(url) {
        this.url = url;
    }

    async setupSong() {
        const { filename, seconds, title } = await Downloader.getMetaData(this.url);
        this.filename = filename;
        this.seconds = seconds;
        this.title = title;
        this.downloaded = false;
    }

    async download() {
        await Downloader.downloadSong(this.url, this.filename);
        this.downloaded = true;
    }

    delete(soundsDir) {
        if (existsSync(join(soundsDir, this.filename + ".wav"))) {
            rmSync(join(soundsDir, this.filename + ".wav"));
        }
    }

    startRemoveTimer(soundsDir) {
        let interval = setInterval(() => {
            this.delete(soundsDir);
            clearInterval(interval);
        }, (parseInt(this.seconds) + 5) * 1000);
    }


}

module.exports = Song;