/* global describe, beforeEach, it */
var request = require('supertest');
var app = require('../../app');
var database = require("../../database.js");
var testUtil = require('../testUtil');

describe('GET /rooms/', function () {

});


describe('POST /rooms/', function () {

    var user = {
        userid: null,
        email: 'user@example.com',
        password: 'test',
        verified: true,
        presenter: false
    };
     var new_user = {
        id: null,
        email: 'user2@example.com',
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
   
    beforeEach('delete the users if they exist', function (done) {
        database.query(
            'DELETE FROM users WHERE email IN ($1, $2, $3)',
            [user.email, new_user.email, presenter.email]
        )
        .then(function () {
            done();
        })
        .catch(done);
    });
    
     var invitationList_1 = {
        id: null,
        subject: 'Test Subject',
        presenter: null
	};
    var invitationList_2 = {
        id: null,
		subject: 'Test Subject 2',
        presenter: null
    };
    
    beforeEach('add two invitation lists', function (done) {
        invitationList_1.presenter = presenter.id;
        invitationList_2.presenter = presenter.id;
        
        testUtil.insertInvitationList(invitationList_1)
        .then(function (invitationList_1_id) {
            invitationList_1.id = invitationList_1_id;
            
            return testUtil.insertInvitationList(invitationList_2);
        })
        .then(function (invitationList_2_id) {
            invitationList_2.id = invitationList_2_id;
            
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
    
   
    var goodRoomName = 'room';
    it('adds a chat room to the database', function (done) {

        var goodInvitationList = invitationList_1.id;

        request(app)
            .post('/rooms/')
            .auth(presenter.email, presenter.password)
            .send({ roomName: goodRoomName, invitation_list: goodInvitationList })
            .expect('Content-Type', /json/)
            .expect(200, done);

    });

    it('does not add a chat room if the invitation list does not exist', function (done) {
        var badInvitationList = invitationList_1.id + 1;

        request(app)
            .post('/rooms/')
            .auth(presenter.email, presenter.password)
            .send({ roomName: goodRoomName, invitation_list: badInvitationList })
            .expect('Content-Type', /json/)
            .expect(400, done);
    });

    it('does not let a user that is not a presenter add a chat room', function (done) {
        request(app)
            .post('/rooms/')
            .auth(user.email, user.password)
            .expect(401, done);
    });

    it('requires a room name', function (done) {
        request(app)
            .post('/rooms/')
            .auth(presenter.email, presenter.password)
            .send({ invitation_list: invitationList_1.id })
            .expect(400, done);
    });
    it('requires an invitation list', function (done) {
        request(app)
            .post('/rooms/')
            .auth(presenter.email, presenter.password)
            .send({ roomName: goodRoomName })
            .expect(400, done);
    });


});


describe('DELETE /rooms/:room_id/', function () {

});


describe('GET /rooms/:room_id/messages/', function () {

});


describe('POST /rooms/:room_id/messages/', function () {

});


describe('DELETE /rooms/:room_id/messages/:message_id', function () {

});


describe('GET /rooms/:room_id/polls', function () {

});


describe('POST /rooms/:room_id/polls', function () {

});
