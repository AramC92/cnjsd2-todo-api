'use strict';

// setup env
require('./config/config');

// npm modules
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const { ObjectID } = require('mongodb');

// local modules
const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const port = process.env.PORT;

const app = express();

// set middleware
app.use(bodyParser.json());

app.get('/todos', (req, res) => {

    Todo.find()
        .then((todos) => {
            // send object back instead of an array
            res.send({ todos });
        })
        .catch((e) => res.status(400).send(e));
});

app.post('/todos', (req, res) => {

    let todo = new Todo({
        text: req.body.text
    });

    todo.save()
        .then((todo) => {
            res.send(todo);
        })
        .catch((e) => res.status(400).send(e));
});

app.get('/todos/:id', (req, res) => {
    
    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }

    Todo.findById(id)
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            res.send({ todo });
        })
        .catch((e) => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {

    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    }

    Todo.findByIdAndRemove(id)
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            res.send({ todo });
        })
        .catch((e) => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
    
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

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
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
        .then((user) => user.generateAuthToken())
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

app.listen(port, () => {
    console.log(`[INFO] Server started on port ${port}`);
});

module.exports = { app };