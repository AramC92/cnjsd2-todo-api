'use strict';

// npm modules
const bodyParser = require('body-parser');
const express = require('express');
const { ObjectID } = require('mongodb');

// local modules
const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const port = process.env.PORT || 3000;

const app = express();

// set middleware
app.use(bodyParser.json());

app.get('/todos', (req, res) => {

    Todo.find()
        .then((todos) => {
            // send object back instead of an array
            res.send({ todos });
        })
        .catch((e) => {
            res.status(400).send(e);
        });
});

app.get('/todos/:id', (req, res) => {

    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.send(404).send();
    }

    Todo.findById(id)
        .then((todo) => {
            if (!todo) {
                return res.send(404).send();
            }
            res.send({ todo });
        })
        .catch((e) => res.status(400).send());
});

app.post('/todos', (req, res) => {

    let todo = new Todo({
        text: req.body.text
    });

    todo.save()
        .then((doc) => {
            res.send(doc);
        })
        .catch((e) => {
            res.status(400).send(e);
        });
});

app.listen(port, () => {
    console.log(`[INFO] Server started on port ${port}.`);
});

module.exports = { app };