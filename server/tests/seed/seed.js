'use strict';

const { ObjectID } = require('mongodb');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');
const jwt = require('jsonwebtoken');

// dummy data
// missing propereties get their values from the defaults defined in the model

let dummyUserOneID = new ObjectID();
let dummyUserTwoID = new ObjectID('599bfb7d92eb1f350e0656da');
let dummyUsers = [
    {
        _id: dummyUserOneID,
        email: 'dummy_1@domain.com',
        password: 'userOnePass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({ _id: dummyUserOneID, access: 'auth' }, process.env.JWT_SECRET).toString()
        }]
    },
    {
        _id: dummyUserTwoID,
        email: '2_dummy@domain.com',
        password: 'userTwoPass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({ _id: dummyUserTwoID, access: 'auth' }, process.env.JWT_SECRET).toString()
        }]
    }
]

let dummyTodos = [
    {
        _id: new ObjectID(),
        text: 'Dummy One',
        _creator: dummyUserOneID
    },
    {
        _id: new ObjectID(),
        text: 'Dummy Two',
        _creator: dummyUserTwoID,
        completed: true,
        completedAt: 333
    }
];

const populateTodos = (done) => {
    // wipe out collection
    Todo.remove({})
        .then(() => {
            // then populate the database with dummy todos
            return Todo.insertMany(dummyTodos); // return allows us to chain promises
        })
        .then(() => done());
};

const populateUsers = (done) => {
    User.remove({})
        .then(() => {
            // manually save each user so that our mongoose hashing middleware actually runs
            let userOne = new User(dummyUsers[0]).save();
            let userTwo = new User(dummyUsers[1]).save();

            // wait untill all promises have been resolved
            return Promise.all([userOne, userTwo]);
        })
        .then(() => done());
};

module.exports = { dummyTodos, populateTodos, dummyUsers, populateUsers };