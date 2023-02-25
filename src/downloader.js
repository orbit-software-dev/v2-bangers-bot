const { createWriteStream, rmSync, readdirSync } = require("fs");
const ytdl = require("ytdl-core");
const { join } = require("path");

class Downloader {

    constructor() {

    }

    static async downloadSong(url, filename) {
        return new Promise((resolve, reject) => {
            const stream = createWriteStream(join(this.soundsDir, filename + ".wav"));
            const piper = ytdl(url, { filter: "audioonly" }).pipe(stream);
            piper.on('finish', () => { piper.end(); resolve(true); });
            piper.on("error", reject);
        });
    }

    static getSong(filename) {
        const files = readdirSync(join(this.soundsDir));
        for (const file of files) {
            if (this.removeExtension(file) === `${filename}`) {
                return join(this.soundsDir, file);
            }
        }
        return null;
    }

    static async getMetaData(url) {
        let info = await ytdl.getBasicInfo(url, { filter: "audioonly" });
        const filename = (Math.random() + 1).toString(36).substring(7);
        const seconds = info.videoDetails.lengthSeconds;
        const title = info.videoDetails.title;
        return {
            filename, seconds, title,
        };
    }

    static setSoundsDir(dir) {
        this.soundsDir = dir;
    }

    static removeExtension = (name) => {
        const parts = name.split(".");
        let newFileName = "";
        for (let i = 0; i < parts.length - 1; i++) {
            newFileName += parts[i];
            newFileName += ".";
        }
        return newFileName.substring(0, newFileName.length - 1);
    };

    static setRemoveSongInterval = (filename, seconds) => {
        let interval = setInterval(() => {
            rmSync(join(this.soundsDir, filename + ".wav"));
            clearInterval(interval);
        }, (parseInt(seconds) + 5) * 1000);
    };
}

module.exports = Downloader;
