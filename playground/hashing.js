'use strict';

// const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let password = 'password';

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash)
    })
});

bcrypt.compare(password, '$2a$10$5Dds3V8xEqVsvyK9qQNDHOd8PSCqpbGthGFEG8XS7aPEUX5rJpgpe', (err, res) => {
    console.log(res);
});

// ************

let payload = {
    data: 'I am part of the JSON data'
};

// sign and verify jason web token
let token = jwt.sign(payload, 'salt');
// would get an error if the signature is not the same
console.log(jwt.verify(token, 'salt'));

// ************

// let token = {
//     payload,
//     hash: SHA256(JSON.stringify(payload) + 'salt').toString()
// }

// if (SHA256(JSON.stringify(token.payload) + 'salt').toString() === token.hash) {
//     console.log('Pass');
// } else {
//     console.log('Fail');
// }