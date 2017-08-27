'use strict';

const expect = require('expect');
const request = require('supertest');

const { ObjectID } = require('mongodb');
const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { dummyTodos, populateTodos, dummyUsers, populateUsers } = require('./seed/seed');

// test lifecycle method. run some code before each test case
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('server.js', () => {

    describe('Todos =====================', () => {
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

    describe('Users =====================', () => {
        describe('POST /users', () => {
            it('should create a new user', (done) => {
                let email = 'somemail@domain.com';
                let password = 'mypassword';

                request(app)
                    .post('/users')
                    .send({ email, password })
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.email).toBe(email);
                        expect(res.body._id).toExist();
                        expect(res.header['x-auth']).toExist();
                    })
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        }
                        User.findOne({ email })
                            .then((user) => {
                                expect(user).toExist();
                                expect(user.password).toNotBe(password);
                                done();
                            })
                            .catch((e) => done(e));
                    });
            });

            it('should not create user if invalid email', (done) => {
                let email = 'shouldntwork@notemail';
                let password = 'myotherpassword';

                request(app)
                    .post('/users')
                    .send({ email, password })
                    .expect(400)
                    .end(done);
            });

            it('should not create user if invalid password', (done) => {
                let email = 'shortpassword@domain.com';
                let password = 'abc';

                request(app)
                    .post('/users')
                    .send({ email, password })
                    .expect(400)
                    .end(done);
            });

            it('should not create user if email already in use', (done) => {
                let email = dummyUsers[0].email;
                let password = 'myotherpassword';

                request(app)
                    .post('/users')
                    .send({ email, password })
                    .expect(400)
                    .end(done);
            });
        });

        describe('GET /users/me', (done) => {
            it('should return user if authenticated', (done) => {
                request(app)
                    .get('/users/me')
                    .set('x-auth', dummyUsers[0].tokens[0].token)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body._id).toBe(dummyUsers[0]._id.toHexString());
                        expect(res.body.email).toBe(dummyUsers[0].email);
                    })
                    .end(done);
            });

            it('should return 401 if not authenticated', (done) => {
                request(app)
                    .get('/users/me')
                    .expect(401)
                    .expect((res) => {
                        expect(res.body).toEqual({});
                    })
                    .end(done);
            });
        });

        describe('POST /users/login', () => {
            it('should give a token to user', (done) => {
                let email = dummyUsers[1].email;
                let password = dummyUsers[1].password;

                request(app)
                    .post('/users/login')
                    .send({ email, password })
                    .expect(200)
                    .expect((res) => {
                        expect(res.header['x-auth']).toExist();
                    })
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        User.findOne({ email })
                            .then((user) => {
                                expect(user.tokens[0]).toInclude({
                                    access: 'auth',
                                    token: res.header['x-auth']
                                });
                                done();
                            })
                            .catch((e) => done(e));
                    });
            });

            it('should not login a user with invalid credentials', (done) => {
                let email = dummyUsers[1].email;
                let password = 'invalidPassword';

                request(app)
                    .post('/users/login')
                    .send({ email, password})
                    .expect(400)
                    .expect((res) => {
                        expect(res.header['x-auth']).toNotExist();
                    })
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        User.findOne({ email })
                            .then((user) => {
                                expect(user.tokens.length).toBe(0);
                                done();
                            })
                            .catch((e) => done(e));
                    });
            });
        });

        describe('DELETE /users/me/token', () => {
            it('should remove token on logout', (done) => {
                request(app)
                    .delete('/users/me/token')
                    .set('x-auth', dummyUsers[0].tokens[0].token)
                    .expect(200)
                    .expect((res) => {
                        expect(res.header['x-auth']).toNotExist();
                    })
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        User.findById(dummyUsers[0]._id)
                            .then((user) => {
                                expect(user.tokens.length).toBe(0);
                                done();
                            })
                            .catch((e) => done(e));
                    });
            });
        });
    });
});