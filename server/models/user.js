'use strict';

const mongoose = require('mongoose');
const { isEmail } = require('validator');
const jwt = require('jsonwebtoken');
const { pick } = require('lodash');

let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            isAsync: true,
            validator: isEmail,
            message: '{VALUE} is not a valid email'
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

// add new methods to user schema

/**
 * Override 'toJSON' default Schema method
 */
UserSchema.methods.toJSON = function () {
    // only show what WE want to show in the api calls, leave off secure properties
    return pick(this.toObject(), ['_id', 'email']);
};

/**
 * Generate an authentification token for a user
 */
UserSchema.methods.generateAuthToken = function () {
    // type of token
    let access = 'auth';

    // token data
    let payload = {
        _id: this._id.toHexString(),
        access
    };

    // generate token by signing the payload
    let token = jwt.sign(payload, 'salt').toString(); // salt should be an env var... placeholder for now

    // push access type and token into the user tokens array
    this.tokens.push({ access, token });

    // return promise with token info (to be used by server.js)
    return this.save()
        .then(() => token); 
};

let User = mongoose.model('User', UserSchema);

module.exports = { User };