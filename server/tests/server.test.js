'use strict';

const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

// dummy data
let dummyTodos = [
    {
        text: 'Dummy One'
    },
    {
        text: 'Dummy Two'
    }
];

// test lifecycle method. run some code before each test case
beforeEach((done) => {
    // wipe out collection
    Todo.remove({})
        .then(() => {
            return Todo.insertMany(dummyTodos);
        })
        .then(() => done());
});

describe('server.js', () => {
    describe('POST /todos', () => {
        it('should create a new todo', (done) => {
            let text = 'Some todo';
            request(app)
                // route
                .post('/todos')
                // send data
                .send({ text })
                // ok
                .expect(200)
                // body matches data sent
                .expect((res) => {
                    expect(res.body.text).toBe(text);
                })
                // async check database
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    Todo.find({ text })
                        .then((todos) => {
                            // data insertion
                            expect(todos.length).toBe(1);
                            // data validation
                            expect(todos[0].text).toBe(text);
                            done();
                        })
                        .catch((e) => done(e));
                });
        });

        it('should not create a new todo with invalid body data', (done) => {
            request(app)
                // route
                .post('/todos')
                // send invalid data. text will be undefined in route. data can't save
                .send({})
                // bad request
                .expect(400)
                // async check database
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    Todo.find()
                        .then((todos) => {
                            // no insertions
                            expect(todos.length).toBe(2);
                            done();
                        })
                        .catch((e) => done(e));
                });
        });
    });

    describe('GET /todos', () => {
        it('should get all todos', (done) => {
            request(app)
                // route
                .get('/todos')
                // ok
                .expect(200)
                // body matches dummy todos length
                .expect((res) => {
                    expect(res.body.todos.length).toBe(2);
                })
                // that's it folks
                .end(done);
        });
    });
});