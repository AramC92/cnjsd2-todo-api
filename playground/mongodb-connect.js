// MongoClient lets you connect to a mongo server and issue comands to alter the db
// const MongoClient = require('mongodb').MongoClient;

// object destructuring
const {MongoClient, ObjectID} = require('mongodb');

// connect to TodoApp db using mongodb protocol on ip 127.0.0.1 and port 27017
// even if the name of the db doesn't exist already it's not necessary to create it
MongoClient.connect('mongodb://127.0.0.1:27017/TodoApp', (err, db) => {
    // handle potential errors with err. interact with database using db
    if (err) {
        return console.log('Unable to connect to Mongo');
    }
    // success!
    console.log('Connected to Mongo');

    // insert todo to collection
    db.collection('Todo').insertOne({
        // object to be inserted
        text: 'Something to do',
        completed: false
    }, (err, docs) => {
        // error handling
        if (err) {
            return console.log('Unable to insert todo', err);
        }
        // docs.ops stores all docs that were inserted
        console.log(JSON.stringify(docs.ops, undefined, 2));
    });

    // insert user to collection
    db.collection('Users').insertOne({
        name: 'Aram',
        age: 25,
        location: 'Mexico'
    }, (err, result) => {
        if (err) {
            return console.log('Unable to insert user', err);
        }
        console.log(JSON.stringify(result.ops, undefined, 2));
        // log id timestamp
        console.log(result.ops[0]._id.getTimestamp());
    });

    // objects ids are composed of 12 bytes
    // first 4 bytes are a timestamp
    // next 3 bytes are a machine identifier (make sure ids are unique)
    // next 2 bytes are a process id
    // last 3 bytes are a counter (similar to mysql)
    // one can overwrite the default id value if required

    // close connection to db
    db.close();
});