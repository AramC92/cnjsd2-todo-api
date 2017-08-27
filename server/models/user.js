'use strict';

const mongoose = require('mongoose');
const { isEmail } = require('validator');
const jwt = require('jsonwebtoken');
const { pick } = require('lodash');
const bcrypt = require('bcryptjs');

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
    // only show what WE want to show in the api calls. leave off secure properties
    return pick(this.toObject(), ['_id', 'email']);
};

/**
 * Generate an authentification token for a user
 */
UserSchema.methods.generateAuthToken = function () {
    // token access type
    let access = 'auth';

    // token payload data
    let payload = {
        _id: this._id.toHexString(), // user id
        access // token type
    };
    // sign token (jwt also supports setting an expiration as its third argument (options argument))
    let token = jwt.sign(payload, 'salt').toString(); // salt should be an env var... placeholder for now

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
    // ensure integrity of token and retrieve data
    try {
        var decoded = jwt.verify(token, 'salt');
    } catch (e) {
        // return new Promise((resolve, reject) => reject());
        return Promise.reject(); // shorthand of the above. prevent the execution of 'then()' in authentificate.js
    }

    // find the associated user (if any) and return a promise
    // returning a promise allows us to use 'then()' in server.js
    return this.findOne({
        '_id': decoded._id, // wrap _id in quotes just for consistency
        // query nested document
        'tokens.token': token, // make sure the token still exists in the database (if not, maybe the user has logged out)
        'tokens.access': 'auth' // make sure this is an auth token and not another kind of token
    });
};

/**
 * Find an user by their given credentials
 */
UserSchema.statics.findByCredentials = function (email, password) {
    // return promise to be chained in server.js
    return this.findOne({ email })
        .then((user) => {
            if (!user) {
                return Promise.reject();
            }

            // when a function doesn't support promises we can wrap it ourselves inside one
            return new Promise((resolve, reject) => {
                // compare plaintext password with hashed password
                bcrypt.compare(password, user.password, (err, match) => {
                    // resolve if they match, reject if they don't
                    (match)
                        ? resolve(user)
                        : reject();
                });
            });
        });
};

// setup mongoose middleware
// do something BEFORE saving the user to the database. (this = individual document)
UserSchema.pre('save', function (next) {
    // since we don't want the password to be hashed multiple times, we need to check if it has been modified
    // for POST /users it will have been indeed modified (going from null to whatever is assigned from body.password)
    if (this.isModified('password')) {
        // use 10 rounds to generate salt
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(this.password, salt, (err, hash) => {
                // override plaintext password with hashed password
                this.password = hash;
                // now the password will be saved to the database
                // from here it won't be modified again (unless the user resets it)
                next();
            });
        })
    } else {
        next();
    }   
});

let User = mongoose.model('User', UserSchema);

module.exports = { User };