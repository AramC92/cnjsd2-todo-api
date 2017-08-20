
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://127.0.0.1:27017/TodoApp', (err, db) => {

    if (err) {
        return console.log('Unable to connect to Mongo');
    }
    console.log('Connected to Mongo');

    db.collection('Todos')
        .deleteOne({ // can use .deleteMany as well
            text: 'Delete stuff'
        })
        .then((result) => {
            // gets a whole object back
            console.log(result);
        })
        .catch((err) => {
            console.log('Something went wrong', err);
        });
    
    db.collection('Todos')
        .findOneAndDelete({
            text: 'Delete stuff 2'
        })
        .then((result) => {
            // can see which object was deleted
            console.log(JSON.stringify(result.value, undefined, 2));
        })
        .catch((err) => {
            console.log('Something went wrong', err);
        });

    db.collection('Users')
        .findOneAndDelete({
            _id: new ObjectID('5999266f708a502064199be9')
        })
        .then((result) => {
            console.log(JSON.stringify(result.value, undefined, 2));
        })
        .catch((err) => {
            console.log('Something went wrong', err);
        });

    db.close();
});