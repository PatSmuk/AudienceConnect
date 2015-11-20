/* global describe, it, beforeEach */
var request = require('supertest');
var app = require('../../app');
var database = require('../../database');
var assert = require('assert');
var testUtil = require('../testUtil');


describe('GET /invitationLists/', function () {

	it('gets all the invitation lists you own', function (done) {
		var invitationList = {
			id: null,
			subject: 'Test Subject'
		}
		var presenter = {
			email: 'presenter@example.com',
			password: 'test',
			verified: true,
			presenter: true
		};

		testUtil.insertUser(presenter)
		.then(function (id) {
			return database.query(
				'INSERT INTO invitation_lists (presenter, subject) VALUES ($1, $2) RETURNING id',
				[id, invitationList.subject]
			)
		})
		.then(function (results) {
			invitationList.id = results[0].id;

			request(app)
				.get('/invitationLists/')
				.auth(presenter.email, presenter.password)
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function (res) {
					assert.deepEqual(res.body, [invitationList]);
				})
				.end(done);
		})
		.catch(done);
	});

	it("requires valid credentials", function (done) {
		request(app)
            .get('/invitationLists/')
            .expect('Content-Type', /json/)
            .expect(401, done);
	});

	it("doesn't allow access to regular users", function (done) {
		var user = {
			email: 'user@example.com',
			password: 'test',
			verified: true,
			presenter: false
		};

		testUtil.insertUser(user)
		.then(function (id) {
			request(app)
				.get('/invitationLists/')
				.auth(user.email, user.password)
				.expect('Content-Type', /json/)
				.expect(401, done);
		})
		.catch(done);
	});
});


describe('POST /invitationLists/', function () {

	it('allows presenters to create invitation lists', function (done) {
		var presenter = {
			email: 'presenter@example.com',
			password: 'test',
			verified: true,
			presenter: true
		};

		testUtil.insertUser(presenter)
		.then(function () {
			request(app)
				.post('/invitationLists/')
				.auth(presenter.email, presenter.password)
				.send({ subject: 'My Cool Subject' })
				.expect('Content-Type', /json/)
				.expect(200, done);
		})
		.catch(done);
	});

	it("requires valid credentials", function (done) {
		request(app)
            .get('/invitationLists/')
            .expect('Content-Type', /json/)
            .expect(401, done);
	});

	it("doesn't allow access to regular users", function (done) {
		var user = {
			email: 'user@example.com',
			password: 'test',
			verified: true,
			presenter: false
		};

		testUtil.insertUser(user)
		.then(function () {
			request(app)
				.get('/invitationLists/')
				.auth(user.email, user.password)
				.expect('Content-Type', /json/)
				.expect(401, done);
		})
		.catch(done);
	});
})


describe('GET /invitationLists/:list_id/', function () {

    var presenter = {
        id: null,
        email: 'presenter@example.com',
        password: 'test',
        verified: true,
        presenter: true
    };
    var user = {
        id: null,
        email: 'user@example.com',
        password: 'test',
        verified: true,
        presenter: true
    }
    var list = {
        id: null,
        presenter: null,
        subject: 'Test Subject'
    }

    beforeEach('add a presenter', function (done) {
        testUtil.insertUser(presenter)
        .then(function (presenter_id) {
            presenter.id = presenter_id;
            list.presenter = presenter.id;
            done();
        })
        .catch(done);
    });

    beforeEach('add a regular user', function (done) {
        testUtil.insertUser(user)
        .then(function (user_id) {
            user.id = user_id;
            done();
        })
        .catch(done);
    });

    beforeEach('add an invitation list belonging to presenter', function (done) {
        testUtil.insertInvitationList(list)
        .then(function (list_id) {
            list.id = list_id;
            done();
        })
        .catch(done);
    });

    beforeEach('add the user to the invitation list', function (done) {
        testUtil.addUserToInvitationList(list.id, user.id)
        .then(done)
        .catch(done);
    });

    it('returns a list of all users on an invitation list', function (done) {
        request(app)
        .get('/invitationLists/'+list.id+'/')
        .auth(presenter.email, presenter.password)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect('['+user.id+']')
        .end(done);
    });

    it('requires authorization', function (done) {
        request(app)
        .get('/invitationLists/'+list.id+'/')
        .expect(401)
        .end(done);
    });

    it("requires the user to own the list", function (done) {
        request(app)
        .get('/invitationLists/'+list.id+'/')
        .auth(user.email, user.password)
        .expect(404)
        .end(done);
    });
});


describe('POST /invitationLists/:list_id/', function () {

});


describe('DELETE /invitationLists/:list_id/:user_id/', function () {

});
