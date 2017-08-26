'use strict';

// const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');

let payload = {
    data: 'I am part of the JSON data'
};

// sign and verify jason web token
let token = jwt.sign(payload, 'salt');
// would get an error if the signature is not the same
console.log(jwt.verify(token, 'salt'));

// let token = {
//     payload,
//     hash: SHA256(JSON.stringify(payload) + 'salt').toString()
// }

// if (SHA256(JSON.stringify(token.payload) + 'salt').toString() === token.hash) {
//     console.log('Pass');
// } else {
//     console.log('Fail');
// }