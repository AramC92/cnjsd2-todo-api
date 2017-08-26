'use strict';

const { User } = require('./../models/user');

let authenticate = (req, res, next) => {
    // retrieve x-auth header from request
    let token = req.header('x-auth');
    
        User.findByToken(token)
            .then((user) => {
                if (!user) {
                    // return res.status(401).send();
                    return Promise.reject(); // we can write this instead of the code above, no need to repeat ourselves
                }
                // export user and token to a property in the request
                req.user = user;
                req.token = token;
                // only run the private route code if the case is successfull
                next();
            })
            // authentification required
            .catch((e) => res.status(401).send());
};

module.exports = { authenticate };