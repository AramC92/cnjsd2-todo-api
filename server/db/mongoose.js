'use strict';

const mongoose = require('mongoose');

// set mongoose to use the native promise library
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/TodoApp');

module.exports = {mongoose};