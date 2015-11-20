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
    
    
    beforeEach('add the first user to the first invitation list', function (done) {
        testUtil.addUserToInvitationList(invitationList_1.id, user.id)
        .then(done)
        .catch(done);
    });
    
    
    var chatRoom_1 = {
        room_name: 'Cat Room',
        invitation_list: null
    };
    var chatRoom_2 = {
        room_name: 'Bat Room',
        invitation_list: null
    };
    
    beforeEach('add two chat rooms', function (done) {
        chatRoom_1.invitation_list = invitationList_1.id;
        chatRoom_2.invitation_list = invitationList_2.id;
        
        testUtil.insertChatRoom(chatRoom_1)
        .then(function () {
            return testUtil.insertChatRoom(chatRoom_2);
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
            .expect(200, done);
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
    var user3 = {
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
            return testUtil.insertUser(user3)
        })
        .then(function(user3_id){
            user3.id = user3_id;
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
    
    
    beforeEach('add the first and third user to the first invitation list', function (done) {
        testUtil.addUserToInvitationList(invitationList_1.id, user.id);
        testUtil.addUserToInvitationList(invitationList_1.id, user3.id)
        .then(done)
        .catch(done);
    });
    beforeEach('add the second user to the second invitation list', function (done) {
        testUtil.addUserToInvitationList(invitationList_2.id, new_user.id)
        .then(done)
        .catch(done);
    });
    var chatRoom_1 = {
        id: null,
        room_name: 'Cat Room',
        invitation_list: null
    };
    var chatRoom_2 = {
        id: null,
        room_name: 'Bat Room',
        invitation_list: null
    };
    
    beforeEach('add two chat rooms', function (done) {
        chatRoom_1.invitation_list = invitationList_1.id;
        chatRoom_2.invitation_list = invitationList_2.id;
        
        testUtil.insertChatRoom(chatRoom_1)
        .then(function (results) {
            chatRoom_1.id = results;
            return testUtil.insertChatRoom(chatRoom_2);
        })
        .then(function (results) {
            chatRoom_2.id = results;
            done();
        })
        .catch(done);
    });
    
    var message1 = {
        sender: null,
        room: null,
        message_text: "Hi"
    };
     var message2 = {
        sender: null,
        room: null,
        message_text: "Message 2"
    };
    var message3 = {
        sender: null,
        room: null,
        message_text: "Message 2"
    };
    beforeEach('add three messages to the first room ', function(done){
        message1.sender = user.id;
        message1.room = chatRoom_1.id;
        message2.sender = user.id;
        message2.room = chatRoom_1.id;
        message3.sender = user3.id;
        message3.room = chatRoom_1.id;
        testUtil.insertMessage(message1);
        testUtil.insertMessage(message2);
        testUtil.insertMessage(message3)
        .then(function(){
            done();
        })
        .catch(done);
    });
    
    var goodChatRoom;
    it('displays messages for the room', function(done){
        goodChatRoom = chatRoom_1.id;
        request(app)
        .get('/rooms/' + goodChatRoom + '/messages/')
        .auth(user.email, user.password)
        .expect(200, done);
        
    });
    
    it('does not let a user that is not in the room see the messages', function(done){
        request(app)
        .get('/rooms/' + chatRoom_1.id + '/messages/')
        .auth(new_user.email, new_user.password)
        .expect(400,done)
    });
    
    it('requires authorization', function(done){
        request(app)
        .get('/rooms/' + chatRoom_1.id + '/messages/')
        .expect(401,done);
    });
    
    it('displays only and all the messages for that room',function(done){
        request(app)
        .get('/rooms/' + chatRoom_1.id + '/messages/')
        .auth(user.email, user.password)
        .expect(function(results){
            if(results.body.length == 3)
                return results;
            return results.status = 400;
        })
        .expect(200,done);
    });
    
    it('displays zero messages when there are none in the room', function(done){
        request(app)
        .get('/rooms/' + chatRoom_2.id + '/messages/')
        .auth(new_user.email, new_user.password)
        .expect('[]')
        .expect(200,done);
    });
});


describe('POST /rooms/:room_id/messages/', function () {

});


describe('DELETE /rooms/:room_id/messages/:message_id', function () {

});


describe('GET /rooms/:room_id/polls', function () {

});


describe('POST /rooms/:room_id/polls', function () {

});
