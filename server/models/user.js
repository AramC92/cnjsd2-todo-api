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
// methods get called with the the individual documents (instance methods) (individual document = this)

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
    // token access type
    let access = 'auth';

    // token data
    let token = {
        _id: this._id.toHexString(), // user id
        access // token type
    };
    // sign token
    token = jwt.sign(token, 'salt').toString(); // salt should be an env var... placeholder for now

    // push token to tokens array (update local user object)
    this.tokens.push({ access, token });
    // save token in database (update database info)
    // return promise with token info (to be used by server.js)
    return this.save()
        .then(() => token); 
};

// add new statics to user schema
// statics get called with the model itself (model methods) (collection = this)

/**
 * Find a user by an auth token
 */
UserSchema.statics.findByToken = function (token) {
    // attempt to verify token and get the data from it
    try {
        var decoded = jwt.verify(token, 'salt');
    } catch (e) {
        // return new Promise((resolve, reject) => reject());
        return Promise.reject(); // shorthand of the above. prevent the execution of 'then()' in authentificate.js
    }

    // find the associated user (if any) and return a promise
    return this.findOne({
        '_id': decoded._id, // wrap _id in quotes just for consistency
        // query nested document
        'tokens.token': token, // make sure the token still exists in the database (if not, maybe the user has logged out)
        'tokens.access': 'auth' // make sure this is an auth token and not another kind of token
    });
};

let User = mongoose.model('User', UserSchema);

module.exports = { User };