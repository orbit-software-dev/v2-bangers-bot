const { MongoClient } = require('mongodb');

class DB {

    constructor() {
        this.url = `${process.env.MONGO_URI}`;
        this.dbName = `${process.env.MONGO_DB_NAME}`;
        this.client = new MongoClient(this.url);
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new DB();
        }
        return this.instance;
    }

    async connect() {
        await this.client.connect();
        this.db = this.client.db(this.dbName);
    }

    getCollection(colName) {
        return this.db.collection(colName);
    }
}

module.exports = DB;
