
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://127.0.0.1:27017/TodoApp', (err, db) => {

    if (err) {
        return console.log('Unable to connect to Mongo');
    }
    console.log('Connected to Mongo');

    db.collection('Users')
        .findOneAndUpdate({
            _id: new ObjectID('59992a54a03c4420bc1b1312')
        },
        {
            $set: { name: 'Derp' }
        },
        {
            returnOriginal: false
        })
        .then((result) => {
            console.log(JSON.stringify(result.value, undefined, 2));
        })
        .catch((err) => {
            console.log('Something went wrong', err);
        });

    db.collection('Users')
        .findOneAndUpdate({
            name: 'Aram'
        },
        {
            $inc: { age: -7 },
            $set: { name: 'Red' }
        },
        {
            returnOriginal: false
        })
        .then((result) => {
            console.log(JSON.stringify(result.value, undefined, 2));
        })
        .catch((err) => {
            console.log('Something went wrong', err);
        });

    db.close();
});