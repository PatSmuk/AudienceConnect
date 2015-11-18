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
	
		testUtil.deleteAllUsers().then(function () {
			return testUtil.insertUser(presenter);
		})
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
		
		testUtil.deleteAllUsers().then(function () {
			return testUtil.insertUser(user);
		})
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
	
		testUtil.deleteAllUsers().then(function () {
			return testUtil.insertUser(presenter);
		})
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
		
		testUtil.deleteAllUsers().then(function () {
			return testUtil.insertUser(user);
		})
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
    
});


describe('POST /invitationLists/:list_id/', function () {
    
});


describe('DELETE /invitationLists/:list_id/:user_id/', function () {
    
});
