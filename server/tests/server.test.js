'use strict';

const expect = require('expect');
const request = require('supertest');

const { ObjectID } = require('mongodb');
const { app } = require('./../server');
const { Todo } = require('./../models/todo');

// dummy data
let dummyTodos = [
    {
        _id: new ObjectID('599bfb7d92eb1f350e0656d7'),
        text: 'Dummy One'
        // completed and completedAt get their values from the defaults
    },
    {
        _id: new ObjectID('599bfb7d92eb1f350e0656d8'),
        text: 'Dummy Two',
        completed: true,
        completedAt: 333
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
                // status
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

    describe('GET /todos/:id', () => {
        it('should get a todo', (done) => {
            let id = dummyTodos[0]._id.toHexString();

            request(app)
                .get(`/todos/${id}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe(dummyTodos[0].text);
                })
                .end(done);
        });

        it('should return 404 if todo not found', (done) => {
            request(app)
                .get(`/todos/${new ObjectID().toHexString()}`)
                .expect(404)
                .end(done);
        });

        it('should return 404 if id invalid', (done) => {
            request(app)
                .get('/todos/555')
                .expect(404)
                .end(done);
        });
    });

    describe('DELETE /todos/:id', () => {
        it('should delete a todo', (done) => {
            let id = dummyTodos[0]._id.toHexString();

            request(app)
                .delete(`/todos/${id}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo._id).toBe(id);
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    Todo.findById(id)
                        .then((todo) => {
                            expect(todo).toNotExist();
                            done();
                        })
                        .catch((e) => done(e));
                });
        });

        it('should return 404 if todo not found', (done) => {
            request(app)
                .delete(`/todos/${new ObjectID().toHexString()}`)
                .expect(404)
                .end(done);
        });

        it('should return 404 if invalid id', (done) => {
            request(app)
                .delete('/todos/555')
                .expect(404)
                .end(done);
        });
    });

    describe('PATCH /todos/:id', () => {
        it('should update a todo', (done) => {
            let id = dummyTodos[0]._id.toHexString();
            let data = {
                text: 'Done with this',
                completed: true
            };

            request(app)
                .patch(`/todos/${id}`)
                .send(data)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe(data.text);
                    expect(res.body.todo.completed).toBe(true);
                    expect(res.body.todo.completedAt).toBeA('number');
                })
                .end(done);
        });

        it('should reset todo completedAt if not completed', (done) => {
            let id = dummyTodos[1]._id.toHexString();
            let data = {
                text: 'Not done',
                completed: false
            };

            request(app)
                .patch(`/todos/${id}`)
                .send(data)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe(data.text);
                    expect(res.body.todo.completed).toBe(false);
                    expect(res.body.todo.completedAt).toNotExist();
                })
                .end(done);
            });

        it('should return 404 if todo not found', (done) => {
            request(app)
                .patch(`/todos/${new ObjectID().toHexString()}`)
                .expect(404)
                .end(done);
        });

        it('should return 404 if invalid id', (done) => {
            request(app)
                .patch('/todos/555')
                .expect(404)
                .end(done);
        });
    });
});