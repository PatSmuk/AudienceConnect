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

    beforeEach('add some users', function (done) {
        testUtil.insertUser(user)
        .then(function (user_id) {
            user.id = user_id;
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

    //this tests if the user exists
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
