'use strict';

const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

let id = '599aa8204921b2033fac5086';

// check if valid id
if (!ObjectID.isValid(id)) {
    console.log('Invalid id');
}

// returns array or empty array if no results
Todo.find({
        _id: id
    })
    .then((todos) => {
        console.log(JSON.stringify(todos, undefined, 2));
    })
    .catch((e) => console.log(e));

// returns object or null if no results
Todo.findOne({
        _id: id
    })
    .then((todo) => {
        console.log(JSON.stringify(todo, undefined, 2));
    })
    .catch((e) => console.log(e));

// query by id
Todo.findById(id)
    .then((todo) => {
        if (!todo) {
            return console.log('Todo not found');
        }
        console.log(JSON.stringify(todo, undefined, 2));
    })
    .catch((e) => console.log(e));

User.findById(id)
    .then((user) => {
        if (!user) {
            return console.log('User not found');
        }
        console.log(JSON.stringify(user, undefined, 2));
    })
    .catch((e) => console.log(e));