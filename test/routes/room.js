/* global describe, beforeEach, it */
var request = require('supertest');
var app = require('../../app');
var database = require('../../database');
var testUtil = require('../testUtil');


describe('GET /rooms/', function () {
    
    var user = {
        id: null,
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
    
    beforeEach('add some users', function (done) {
        testUtil.insertUser(user).then(function (user_id) {
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
    
    
    var invitationList_1 = {
        id: null,
        subject: 'Test Subject'
	};
    var invitationList_2 = {
        id: null,
		subject: 'Test Subject 2'
    };
    
    beforeEach('add two invitation lists', function (done) {
        database.query(
            'INSERT INTO invitation_lists (presenter, subject) VALUES ($1, $2) RETURNING id',
            [presenter.id, invitationList_1.subject]
        )
        .then(function (invitation_list_1_results) {
            invitationList_1.id = invitation_list_1_results[0].id;
            
            return database.query(
                'INSERT INTO invitation_lists (presenter, subject) VALUES ($1,$2) RETURNING id',
                [presenter.id, invitationList_2.subject]
            );
        })
        .then(function (invitation_list_2_results) {
            invitationList_2.id = invitation_list_2_results[0].id;
            
            done();
        })
        .catch(done);
    });
    
    
    beforeEach('add the first user to the first invitation list', function (done) {
        database.query(
            'INSERT INTO invitation_list_members VALUES ($1, $2)',
            [invitationList_1.id, user.id]
        )
        .then(function () {
            done();
        })
        .catch(done);
    });
    
    
    var chatRoom_1 = {
        room_name: 'Cat Room',
    };
    var chatRoom_2 = {
        room_name: 'Bat Room',
    };
    
    beforeEach('add two chat rooms', function (done) {
        database.query(
            'INSERT INTO chat_rooms (room_name, invitation_list) VALUES ($1, $2)',
            [chatRoom_1.room_name, invitationList_1.id]
        )
        .then(function () {
            return database.query(
                'INSERT INTO chat_rooms (room_name, invitation_list) VALUES ($1, $2)',
                [chatRoom_2.room_name, invitationList_2.id]
            );
        })
        .then(function () {
            done();
        })
        .catch(done);
    });


    it('returns a list of rooms associated with the user', function (done) {
        request(app)
            .get('/rooms/')
            .auth(user.email, user.password)
            .expect('Content-Type', /json/)
            .expect(200,done);
    });
    
    it("returns only the rooms the user belongs to", function (done) {
        request(app)
            .get('/rooms/')
            .auth(user.email, user.password)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(function (results) {
                if (results.body.length != 1)
                    return "not correct number of rooms";
            })
            .end(done);
    });
    
    it('requires valid credentials', function (done) {
        request(app)
            .get('/rooms/')
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
    
    it('returns zero rooms for a user that just registered', function (done) {
        request(app)
            .get('/rooms/')
            .auth(new_user.email, new_user.password)
            .expect(200)
            .expect('[]', done);
    });
    
    it('returns rooms that you own', function (done) {
        request(app)
            .get('/rooms/')
            .auth(presenter.email, presenter.password)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(function (res) {
                if (res.body.length != 2)
                    return 'missing rooms that we own';
            })
            .end(done);
    })
});


describe('POST /rooms/', function () {

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
