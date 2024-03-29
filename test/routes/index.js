/* global describe, beforeEach, it */

var request = require('supertest');
var app = require('../../app');
var database = require('../../database');


describe('GET /', function () {
    it('returns good old-fashioned HTML', function (done) {
        request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(done);
    });
});


describe('POST /register', function () {

    var goodEmail = 'test@example.com';
    var goodPassword = 'test';

    beforeEach('ensure the email is not taken', function (done) {
        database().then(function (client) {
            return client[0].query('DELETE FROM users WHERE email = $1', [goodEmail])
            .then(function () {
                client[1]();
                done();
            })
            .catch(function (err) { client[1](); done(err); });
        })
        .catch(done);
    });

    it('allows people to create accounts', function (done) {
        request(app)
        .post('/register')
        .send({ email: goodEmail, password: goodPassword })
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('requires an email address', function (done) {
        request(app)
        .post('/register')
        .send({ password: goodPassword })
        .expect('Content-Type', /json/)
        .expect(400, done);
    });

    it('requires a password', function (done) {
        request(app)
        .post('/register')
        .send({ email: goodEmail })
        .expect('Content-Type', /json/)
        .expect(400, done);
    });

    var badEmails = ['test', 'test@', '@example.com', '@example', 'testexample.com', 'test@example'];

    badEmails.forEach(function (badEmail) {
        it("doesn't accept \"" + badEmail + "\" as an email address", function (done) {
            request(app)
            .post('/register')
            .send({ email: badEmail, password: goodPassword })
            .expect('Content-Type', /json/)
            .expect(400, done);
        });
    });

    it("doesn't accept a password over 32 characters long", function (done) {
        request(app)
        .post('/register')
        .send({ email: goodEmail, password: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' })
        .expect('Content-Type', /json/)
        .expect(400, done);
    });
});
