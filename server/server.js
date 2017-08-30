'use strict';

// setup env
require('./config/config');

// npm modules
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcryptjs');

// local modules
const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const port = process.env.PORT;

const app = express();

// set middleware
app.use(bodyParser.json());

app.get('/todos', authenticate, (req, res) => {

    Todo.find({
            _creator: req.user._id
        })
        .then((todos) => {
            // send object back instead of an array
            res.send({ todos });
        })
        .catch((e) => res.status(400).send(e));
});

app.post('/todos', authenticate, (req, res) => {

    let todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save()
        .then((todo) => {
            res.send(todo);
        })
        .catch((e) => res.status(400).send(e));
});

app.get('/todos/:id', authenticate, (req, res) => {
    
    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }

    Todo.findOne({
            _id: id,
            _creator: req.user._id
        })
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            res.send({ todo });
        })
        .catch((e) => res.status(400).send());
});

app.delete('/todos/:id', authenticate, (req, res) => {

    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }

    Todo.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        })
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            res.send({ todo });
        })
        .catch((e) => res.status(400).send());
});

app.patch('/todos/:id', authenticate, (req, res) => {
    
    let id = req.params.id;
    // cherry pick certain properties from the request body (if they exist) and assign them to an object
    let body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    // if (_.isEmpty(body)) return res.status(400).send(); <-- Something to consider but not essential

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = Date.now();
    } else {
        body.completedAt = null;
        body.completed = false;
    }

    Todo.findOneAndUpdate({
            _id: id,
            _creator: req.user._id
        }, 
        {
            $set: body
        },
        {
            new: true
        })
        .then((todo) => {
            if (!todo) {
                res.status(404).send();
            }
            res.send({ todo });
        })
        .catch((e) => res.status(400).send());
});

app.post('/users', (req, res) => {

    let body = _.pick(req.body, ['email', 'password']);
    let user = new User(body);

    user.save()
        .then(() => user.generateAuthToken())
        .then((token) => {
            // generate custom header and assign token to it. also respond with user document
            res.header('x-auth', token).send(user);
        })
        .catch((e) => res.status(400).send(e));
});

// private route (make sure user is properly authentificated)
app.get('/users/me', authenticate, (req, res) => {
    // get user from the authenticate middleware
    res.send(req.user);
});

app.post('/users/login', (req, res) => {

    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password)
        .then((user) => {
            // unlike above, we're chaining generateAuthToken in the same block
            // otherwise the user returned by findByCredentials would be out of scope
            // by chaining and returning a promise, any errors (if any) will be handled by the catch below
            return user.generateAuthToken()
                .then((token) => {
                    // generated tokens are different each time because of the 'iat' token property (time created)
                    res.header('x-auth', token).send(user);
                });
        })
        .catch((e) => res.status(400).send());
});

app.delete('/users/me/token', authenticate, (req, res) => {

    req.user.removeToken(req.token)
        .then(() => res.status(200).send())
        .catch((e) => res.status(400).send());
});

app.listen(port, () => {
    console.log(`[INFO] Server started on port ${port}`);
});

module.exports = { app };