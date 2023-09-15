var pg = require("pg");
var config = {
    user: 'zpyedret',
    database: 'zpyedret',
    password: 'uUuWPtrFTUuJyYQtwS3nHuwnM6KD9hf5',
    host: 'surus.db.elephantsql.com',
    port: 5432,
    max: 100,
    idleTimeoutMillis: 3000,
};
var pool = new pg.Pool(config);
module.exports = {pool};