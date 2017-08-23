'use strict';

const mongoose = require('mongoose');

// set mongoose to use the native promise library
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true })
    .then(() => console.log('[INFO] Successfully connected to Mongo'))
    .catch((err) => console.log(`[ERROR] Database connection error: ${err.message}`));

module.exports = { mongoose };