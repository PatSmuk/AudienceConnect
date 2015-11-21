/* global describe, beforeEach, it */
var request = require('supertest');
var app = require('../../app');
var testUtil = require('../testUtil');
var database = require('../../database');

describe('GET /users/:user_id/', function () {
    var user = {
        id: null,
        email: 'user@example.com',
        password: 'test',
        verified: true,
        presenter: false
    };
    var new_user = {
        id: null,
        email: 'user3@example.com',
        password: 'test',
        verified: true,
        presenter: false
    };
    var presenter = {
        id: null,
        email: 'presenter@example.com',
        password: 'test',
        verified: true,
        presenter: true
    };

    beforeEach('delete the users if they exist!!!!!!!!', function (done) {
        database.query(
            'DELETE FROM users WHERE email IN ($1, $2, $3)',
            [user.email, new_user.email, presenter.email]
        )
        .then(function () {
            done();
        })
        .catch(done);
    });


    beforeEach('add some users', function (done) {
        testUtil.insertUser(user)
        .then(function (user_id) {
            user.id = user_id;

            return testUtil.insertUser(new_user);
        })
        .then(function (new_user_id) {
            new_user.id = new_user_id;

            return testUtil.insertUser(presenter);
        })
        .then(function (presenter_id) {
            presenter.id = presenter_id;

            done();
        })
        .catch(done);
    });

    //no auth check if user exists
    it('requires authentication', function (done) {
        var usr = user.id;
        request(app)
            .get('/users/' + usr)
            .expect('Content-Type', /json/)
            .expect(401, done)
    });

    //this tests if the fucking user exists
    it('returns information about a user', function (done) {
        request(app)
            .get('/users/' + user.id)
            .auth(user.email, user.password)
            .expect('Content-Type', /json/)
            .expect(200, done)
    });

    //this tests if the user doesnt exist
    it("returns a 404 if the user doesn't exist", function (done) {
        var usr = 9999;
        request(app)
            .get('/users/' + usr)
            .auth(user.email, user.password)
            .expect('Content-Type', /json/)
            .expect(404, done)
    });
});
