

class Queue {
    constructor() {
        this.q = [];
    }

    add(song) {
        this.q.push(song);
    }

    get() {
        return this.q;
    }

    next() {
        return this.q.shift();
    }

    shuffle() {
        const oldQueue = [...this.q];
        for (let i = oldQueue.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [oldQueue[i], oldQueue[j]] = [oldQueue[j], oldQueue[i]];
        }
        this.q = oldQueue;
    }

    delete(soundsDir) {
        for (const song of this.q) {
            song.delete(soundsDir);
        }
    }
}

module.exports = Queue;