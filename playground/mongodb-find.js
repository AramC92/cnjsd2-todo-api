
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://127.0.0.1:27017/TodoApp', (err, db) => {

    if (err) {
        return console.log('Unable to connect to Mongo');
    }
    console.log('Connected to Mongo');

    // recover all todos
    db.collection('Todos')
        .find()
        .toArray()
        .then((result) => {
            console.log('Todos');
            console.log(JSON.stringify(result, undefined, 2));
        })
        .catch((err) => {
            console.log('Unable to recover data', err);
        });

    // recover user that has id
    db.collection('Users')
        .find({
            _id: new ObjectID('59992a54a03c4420bc1b1312')
        })
        .toArray()
        .then((result) => {
            console.log('User with id 59992a54a03c4420bc1b1312');
            console.log(JSON.stringify(result, undefined, 2));
        })
        .catch((err) => {
            console.log('Unable to retrieve data', err);
        });

    // recover number of users that have that name
    db.collection('Users')
        .find({
            name: 'Aram'
        })
        .count()
        .then((count) => {
            console.log('Number of users with name Aram')
            console.log(`Count: ${count}`);
        })
        .catch((err) => {
            console.log('Unable to recover data', err);
        });
    
    db.close();
});