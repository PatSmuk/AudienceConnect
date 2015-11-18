/* global describe, it, beforeEach */
var request = require('supertest');
var app = require('../../app');
var database = require('../../database');
var assert = require('assert');
var testUtil = require('../testUtil');


describe('GET /invitationLists/', function () {
	var user = {
		id: null,
		email: 'user@example.com',
		password: 'test'
	};
	var presenter = {
		id: null,
		email: 'presenter@example.com',
		password: 'test'
	};
	var invitationList = {
		id: null,
		subject: 'Test Subject'
	}
	
    beforeEach('delete all users', function (done) {
		user.id = null;
		presenter.id = null;
		
		testUtil.deleteAllUsers().then(done).catch(done);
	});
	
	beforeEach('add a regular user', function (done) {
		testUtil.insertUser(user.email, user.password, true, false)
		.then(function (id) {
			user.id = id;
			done();
		})
		.catch(done);
	});
	
	beforeEach('add a presenter user', function (done) {
		testUtil.insertUser(presenter.email, presenter.password, true, true)
		.then(function (id) {
			presenter.id = id;
			done();
		})
		.catch(done);
	});
	
	beforeEach('add an invitation list for the presenter', function (done) {
		database.query(
			'INSERT INTO invitation_lists (presenter, subject) VALUES ($1, $2) RETURNING id',
			[presenter.id, invitationList.subject]
		)
		.then(function (results) {
			invitationList.id = results[0].id;
			done();
		})
		.catch(done);
	});
	
	it('gets all the invitation lists you own', function (done) {
		request(app)
            .get('/invitationLists/')
            .auth(presenter.email, presenter.password)
            .expect('Content-Type', /json/)
            .expect(200)
			.expect(function (res) {
				assert.deepEqual(res.body, [invitationList]);
			})
			.end(done);
	});
	
	it("requires valid credentials", function (done) {
		request(app)
            .get('/invitationLists/')
            .expect('Content-Type', /json/)
            .expect(401, done);
	});
	
	it("doesn't allow access to regular users", function (done) {
		request(app)
            .get('/invitationLists/')
            .auth(user.email, user.password)
            .expect('Content-Type', /json/)
            .expect(401, done);
	});
});


describe('POST /invitationLists/', function () {
    
})


describe('GET /invitationLists/:list_id/', function () {
    
});


describe('POST /invitationLists/:list_id/', function () {
    
});


describe('DELETE /invitationLists/:list_id/:user_id/', function () {
    
});
