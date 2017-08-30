'use strict';

const mongoose = require('mongoose');

let Todo = mongoose.model('Todo', {
    text: {
        type: String,
        minlength: 1,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
    // underscore prefix is a convetion to know this property holds an ObjectID
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = { Todo };