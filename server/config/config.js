'use strict';

let env = process.env.NODE_ENV || 'development';

console.log(`-- NODE_ENV='${env}' -- -- - -`);

if (env === 'development' || env === 'test') {
    let config = require('./config.json');
    let configEnv = config[env];
    
    Object.keys(configEnv).forEach(key => {
        process.env[key] = configEnv[key];
    });
}