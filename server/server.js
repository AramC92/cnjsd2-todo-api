'use strict';

// npm modules
const bodyParser = require('body-parser');
const express = require('express');

// local modules
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

const port = process.env.PORT || 3000;

var app = express();

// set middleware
app.use(bodyParser.json());

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
        })
});

app.listen(port, () => {
    console.log(`[INFO] Server started on port ${port}.`)
});