/* global describe, beforeEach, it */

var request = require('supertest');
var app = require('../../app');
var database = require('../../database');
var testUtil = require('../testUtil');
var assert = require('assert');


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
    var user = {
        userid: null,
        email: 'user@example.com',
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
            'DELETE FROM users WHERE email IN ($1, $2)',
            [user.email, presenter.email]
        )
        .then(function () {
            done();
        })
        .catch(done);
    });

    var invitationList = {
        id: null,
        subject: 'Test Subject',
        presenter: null
	};

    beforeEach('add some users', function (done) {
        testUtil.insertUser(user)
            .then(function (user_id) {
                user.id = user_id;

                return testUtil.insertUser(presenter);
            })
            .then(function (presenter_id) {
                presenter.id = presenter_id;

                done();
            })
            .catch(done);
    });

    beforeEach('add an invitation lists', function (done) {
        invitationList.presenter = presenter.id;

        testUtil.insertInvitationList(invitationList)
        .then(function (invitationList_id) {
            invitationList.id = invitationList_id;

            done();
        })
        .catch(done);
    });

    var goodRoomName = 'room';

    it('adds a chat room to the database', function (done) {
        request(app)
            .post('/rooms/')
            .auth(presenter.email, presenter.password)
            .send({ roomName: goodRoomName, invitationList: invitationList.id })
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('does not add a chat room if the invitation list does not exist', function (done) {
        var badInvitationList = invitationList.id + 100;
        // Make sure our non-existent chat room doesn't exist.
        database.query('DELETE FROM chat_rooms WHERE id = $1', [badInvitationList])
        .then(function () {
            request(app)
                .post('/rooms/')
                .auth(presenter.email, presenter.password)
                .send({ roomName: goodRoomName, invitationList: badInvitationList })
                .expect('Content-Type', /json/)
                .expect(400, done);
        })
        .catch(done);
    });

    it('does not let a user that is not a presenter add a chat room', function (done) {
        request(app)
            .post('/rooms/')
            .auth(user.email, user.password)
            .send({ roomName: goodRoomName, invitationList: invitationList.id })
            .expect(401, done);
    });

    it('requires a room name', function (done) {
        request(app)
            .post('/rooms/')
            .auth(presenter.email, presenter.password)
            .send({ invitationList: invitationList.id })
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
    var user = {
        id: null,
        email: 'user@example.com',
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

     var presenter2 = {
        id: null,
        email: 'presenter2@example.com',
        password: 'test',
        verified: true,
        presenter: true
    };

    beforeEach('delete the users if they exist', function (done) {
        database.query(
            'DELETE FROM users WHERE email IN ($1, $2, $3)',
            [user.email, presenter.email, presenter2.email]
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

            return testUtil.insertUser(presenter);
        })
        .then(function (presenter_id) {
            presenter.id = presenter_id;

            return testUtil.insertUser(presenter2);
        })
        .then(function (presenter2_id) {
            presenter2.id = presenter2_id
            done();
        })
        .catch(done);
    });

     var invitationList = {
        id: null,
        subject: 'Test Subject',
        presenter: null
	};

    beforeEach('add an invitation list', function (done) {
        invitationList.presenter = presenter.id;

        testUtil.insertInvitationList(invitationList)
        .then(function (invitationList_1_id) {
            invitationList.id = invitationList_1_id;

            done();
        })
        .catch(done);
    });

    var chatRoom = {
        room_name: 'Cat Room',
        invitation_list: null,
        id: null
    };

    beforeEach('add a chat room', function (done) {
        chatRoom.invitation_list = invitationList.id;

        testUtil.insertChatRoom(chatRoom)
        .then(function (roomNumber) {
            chatRoom.id = roomNumber;
            done();
        })
        .catch(done);
    });

    it('deletes the chatroom specified ', function(done){
       var goodRoom = chatRoom.id;
       request(app)
       .delete('/rooms/'+ goodRoom +'/')
       .auth(presenter.email, presenter.password)
       .expect('{}')
       .expect('Content-Type', /json/)
       .expect(200)
       .end(function (err) {
           if (err) done(err);
           database.query('SELECT id FROM chat_rooms WHERE id = $1',[goodRoom])
           .then(function (results) {
               assert.equal(results.length, 0, 'Room should not show up in SELECT query');
               done();
           })
           .catch(done);
       });
    });

    it('requires the presenter to own the room', function(done){
        var goodRoom = chatRoom.id;
        request(app)
       .delete('/rooms/'+ goodRoom +'/')
       .auth(presenter2.email, presenter2.password)
       .expect(400)
       .end(done);
    });

    it('requires the user at least be a presenter', function(done){
       var goodRoom = chatRoom.id;
       request(app)
       .delete('/rooms/'+ goodRoom +'/')
       .auth(user.email, user.password)
       .expect(401,done);
    });

    it('requires a valid room number', function(done){
        var badRoom = chatRoom.id + 1;
        request(app)
        .delete('/rooms/'+ badRoom +'/')
        .auth(presenter.email, presenter.password)
        .expect(400,done);
    });
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

    it("allows audience members to see the room's messages", function(done){
        request(app)
        .get('/rooms/' + chatRoom_1.id + '/messages/')
        .auth(user.email, user.password)
        .expect(200)
        .expect(function (res) {
            if (res.body.length != 3) {
                return 'Expected 3 messages in room';
            }
        })
        .end(done);
    });

    it("allows the room's owner to see the room's messages", function(done){
        request(app)
        .get('/rooms/' + chatRoom_1.id + '/messages/')
        .auth(presenter.email, presenter.password)
        .expect(200)
        .expect(function (res) {
            if (res.body.length != 3) {
                return 'Expected 3 messages in room';
            }
        })
        .end(done);
    });

    it('does not let a user that is not in the room see the messages', function(done){
        request(app)
        .get('/rooms/' + chatRoom_1.id + '/messages/')
        .auth(new_user.email, new_user.password)
        .expect(404,done)
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

    var user = {
        id: null,
        email: 'user@example.com',
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
    var hackerMan = {
        id: null,
        email: 'greatest_hacker@example.com',
        password: 'C64',
        verified: true,
        presenter: false
    }

    beforeEach('delete the users if they exist', function (done) {
        database.query(
            'DELETE FROM users WHERE email IN ($1, $2, $3)',
            [user.email, presenter.email, hackerMan.email]
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
            return testUtil.insertUser(presenter);
        })
        .then(function (presenter_id) {
            presenter.id = presenter_id;
            return testUtil.insertUser(hackerMan);
        })
        .then(function (hacker_id) {
            hackerMan.id = hacker_id;
            done();
        })
        .catch(done);
    });

    var invitationList = {
        id: null,
        subject: 'Test Subject',
        presenter: null
    };

    beforeEach('add two invitation lists', function (done) {
        invitationList.presenter = presenter.id;

        testUtil.insertInvitationList(invitationList)
        .then(function (invitationList_id) {
            invitationList.id = invitationList_id;

            done();
        })
        .catch(done);
    });

    beforeEach('add the user to the invitation list', function (done) {
        testUtil.addUserToInvitationList(invitationList.id, user.id)
        .then(done)
        .catch(done);
    });

    var chatRoom = {
        room_name: 'Cat Room',
        invitation_list: null
    };

    beforeEach('add a chat rooms', function (done) {
        chatRoom.invitation_list = invitationList.id;
        testUtil.insertChatRoom(chatRoom)
        .then(function (results) {
            return chatRoom.id = results;
        })
        .then(function () {
            done();
        })
        .catch(done);
    });

    var good_message_text = 'LMAOFUCK';

    it('allows room owners to send messages', function (done) {

        database.query('DELETE FROM messages WHERE room = $1', [chatRoom.id])
        .then(function () {

            request(app)
            .post('/rooms/' + chatRoom.id + '/messages/')
            .auth(user.email, user.password)
            .send({ message: good_message_text })
            .expect(200)
            .end(function (err) {
                if (err) return done(err);

                database.query("SELECT * FROM messages WHERE room = $1", [chatRoom.id])
                .then(function (results) {
                    assert.equal(results.length, 1, 'Expected 1 message in the chat room');
                    done();
                });
            });
        })
        .catch(done);
    });

    it('allows audience members to send messages', function (done) {

        database.query('DELETE FROM messages WHERE room = $1', [chatRoom.id])
        .then(function () {

            request(app)
            .post('/rooms/' + chatRoom.id + '/messages/')
            .auth(presenter.email, presenter.password)
            .send({ message: good_message_text })
            .expect(200)
            .end(function (err) {
                if (err) return done(err);

                database.query("SELECT * FROM messages WHERE room = $1", [chatRoom.id])
                .then(function (results) {
                    assert.equal(results.length, 1, 'Expected 1 message in the chat room');
                    done();
                });
            });
        })
        .catch(done);
    });

    it('requires valid credentials', function (done) {
        request(app)
            .post('/rooms/' + chatRoom.id + '/messages/')
            .expect(401, done);
    });

    it('requires a message', function (done) {
        request(app)
            .post('/rooms/' + chatRoom.id + '/messages/')
            .auth(presenter.email, presenter.password)
            .expect(400, done);
    });

    it('ensures that the room exists', function (done) {
        request(app)
            .post('/rooms/2/messages/')
            .auth(presenter.email, presenter.password)
            .send({ message: good_message_text })
            .expect(404, done);
    });

    it('requires the user to have access to the room', function (done) {
        request(app)
            .post('/rooms/' + chatRoom.id + '/messages/')
            .auth(hackerMan.email, hackerMan.password)
            .send({ message: 'HACKED LOL' })
            .expect(404, done);
    });
});


describe('DELETE /rooms/:room_id/messages/:message_id', function () {
    var user = {
        id: null,
        email: 'user@example.com',
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
    var hackerMan = {
        id: null,
        email: 'greatest_hacker@example.com',
        password: 'C64',
        verified: true,
        presenter: true
    };
    var newUser = {
        id: null,
        email: 'noob_face@example.com',
        password: 'hunter2',
        verified: true,
        presenter: false
    };

    beforeEach('add some users', function (done) {
        testUtil.insertUser(user)
        .then(function (user_id) {
            user.id = user_id;
            return testUtil.insertUser(presenter);
        })
        .then(function (presenter_id) {
            presenter.id = presenter_id;
            return testUtil.insertUser(hackerMan);
        })
        .then(function (hacker_id) {
            hackerMan.id = hacker_id;
            return testUtil.insertUser(newUser);
        })
        .then(function (new_user_id) {
            newUser.id = new_user_id;
            done();
        })
        .catch(done);
    });

    var invitationList = {
        id: null,
        subject: 'Test Subject',
        presenter: null
    };

    beforeEach('add an invitation list', function (done) {
        invitationList.presenter = presenter.id;

        testUtil.insertInvitationList(invitationList)
        .then(function (invitationList_id) {
            invitationList.id = invitationList_id;

            done();
        })
        .catch(done);
    });

    beforeEach('add the user and the other presenter to the invitation list', function (done) {
        testUtil.addUserToInvitationList(invitationList.id, user.id)
        .then(function () {
            return testUtil.addUserToInvitationList(invitationList.id, hackerMan.id);
        })
        .then(done)
        .catch(done);
    });

    var chatRoom = {
        room_name: 'Cat Room',
        invitation_list: null
    };

    beforeEach('add a chat rooms', function (done) {
        chatRoom.invitation_list = invitationList.id;

        testUtil.insertChatRoom(chatRoom)
        .then(function (chatRoom_id) {
            chatRoom.id = chatRoom_id;
            done();
        })
        .catch(done);
    });

    var message = {
        id: null,
        sender: null,
        room: null,
        message_text: 'Test message'
    }

    beforeEach('add a message in the chat room', function (done) {
        message.sender = user.id;
        message.room = chatRoom.id;

        testUtil.insertMessage(message)
        .then(function (message_id) {
            message.id = message_id;
            done();
        })
        .catch(done);
    });

    it('allows presenters to censor messages', function (done) {
        request(app)
            .delete('/rooms/' + chatRoom.id + '/messages/' + message.id)
            .auth(presenter.email, presenter.password)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect('{}')
            .end(function (err) {
                if (err) done(err);

                database.query('SELECT censored FROM messages WHERE id = $1', [message.id])
                .then(function (results) {
                    if (results.length != 1)
                        return 'Expected exactly one message of ID ' + message.id;
                    if (!results[0].censored)
                        return 'Expected censored flag to be set';
                    done();
                });
            })
    });

    it("requires credentials", function (done) {
        request(app)
            .delete('/rooms/' + chatRoom.id + '/messages/' + message.id)
            .expect(401)
            .expect('Content-Type', /json/)
            .end(done);
    });

    it("doesn't allow users to censor messages", function (done) {
        request(app)
            .delete('/rooms/' + chatRoom.id + '/messages/' + message.id)
            .auth(user.email, user.password)
            .expect(403)
            .expect('Content-Type', /json/)
            .end(done);
    });

    it("doesn't allow other presenters to censor messages in rooms they don't own", function (done) {
        request(app)
            .delete('/rooms/' + chatRoom.id + '/messages/' + message.id)
            .auth(hackerMan.email, hackerMan.password)
            .expect(403)
            .expect('Content-Type', /json/)
            .end(done);
    });

    it("only accepts integers for the chat room ID", function (done) {
        request(app)
            .delete('/rooms/null/messages/' + message.id)
            .auth(presenter.email, presenter.password)
            .expect(400)
            .expect('Content-Type', /json/)
            .end(done);
    });

    it("only accepts integers for the message ID", function (done) {
        request(app)
            .delete('/rooms/' + chatRoom.id + '/messages/null')
            .auth(presenter.email, presenter.password)
            .expect(400)
            .expect('Content-Type', /json/)
            .end(done);
    });

    it("requires a chat room that exists", function (done) {
        request(app)
            .delete('/rooms/' + (chatRoom.id + 1) + '/messages/' + message.id)
            .auth(presenter.email, presenter.password)
            .expect(404)
            .expect('Content-Type', /json/)
            .end(done);
    });

    it("requires a message that exists", function (done) {
        request(app)
            .delete('/rooms/' + chatRoom.id + '/messages/' + (message.id + 1))
            .auth(presenter.email, presenter.password)
            .expect(404)
            .expect('Content-Type', /json/)
            .end(done);
    });
});


describe('GET /rooms/:room_id/polls', function () {
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

    beforeEach('add two invitation lists', function (done) {
        invitationList_1.presenter = presenter.id;

        testUtil.insertInvitationList(invitationList_1)
            .then(function (invitationList_1_id) {
                invitationList_1.id = invitationList_1_id;

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

    beforeEach('add two chat rooms', function (done) {
        chatRoom_1.invitation_list = invitationList_1.id;

        testUtil.insertChatRoom(chatRoom_1)
            .then(function (results) {
                chatRoom_1.id = results;
                done();
            })
            .catch(done);
    });

    var polls_1 = {
        room: null,
        question: "HelloWord"
    }

    beforeEach('adds a poll', function (done) {
        polls_1.room = chatRoom_1.id;
        testUtil.insertPoll(polls_1)
            .then(function (results) {
                return polls_1.id = results;
            })
            .then(function () {
                done();
            })
            .catch(done);
    });

    it('returns a list of polls in the room to audience members', function(done){
        request(app)
            .get('/rooms/'+polls_1.room+'/polls')
            .auth(user.email, user.password)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(/HelloWord/)
            .end(done);
    });

    it('requires valid credentials', function (done){
        request(app)
            .get('/rooms/'+polls_1.room+'/polls')
            .auth(new_user.email, new_user.password)
            .expect(404, done);
    });

    it('checks to see if the room exists', function(done){
        request(app)
            .get('/rooms/2/polls')
            .auth(user.email, user.password)
            .expect(404, done);
    });

    it("returns a list of polls in the room to the room's owner", function (done) {
        request(app)
            .get('/rooms/'+polls_1.room+'/polls')
            .auth(presenter.email, presenter.password)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(/HelloWord/)
            .end(done);
    })
});


describe('POST /rooms/:room_id/polls', function () {
    var user = {
        id: null,
        email: 'user@example.com',
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

    beforeEach('add some users', function (done) {
        testUtil.insertUser(user)
        .then(function (user_id) {
            user.id = user_id;

            return testUtil.insertUser(presenter);
        })
        .then(function (presenter_id) {
            presenter.id = presenter_id;

            done();
        })
        .catch(done);
    });

    var invitationList = {
        id: null,
        subject: 'Test Subject',
        presenter: null
	};

    beforeEach('add two invitation lists', function (done) {
        invitationList.presenter = presenter.id;

        testUtil.insertInvitationList(invitationList)
        .then(function (invitationList_id) {
            invitationList.id = invitationList_id;

            done();
        })
        .catch(done);
    });

    beforeEach('add the first user to the first invitation list', function (done) {
        testUtil.addUserToInvitationList(invitationList.id, user.id)
        .then(done)
        .catch(done);
    });

    var chatRoom = {
        room_name: 'Cat Room',
        invitation_list: null
    };

    beforeEach('add two chat rooms', function (done) {
        chatRoom.invitation_list = invitationList.id;

        testUtil.insertChatRoom(chatRoom)
        .then(function(results){
            return chatRoom.id = results;
        })
        .then(function () {
            done();
        })
        .catch(done);
    });

    var pres_question = "Do you like cheese?";

    it("adds a new poll to the chat room", function (done) {
        request(app)
        .post('/rooms/'+chatRoom.id+'/polls')
        .auth(presenter.email, presenter.password)
        .send({ question: pres_question })
        .expect(200, done);
    });

    it("requires authorization", function (done) {
        request(app)
        .post('/rooms/'+chatRoom.id+'/polls')
        .expect(401, done);
    });

    it("doesn't allow normal users to create polls", function (done) {
        request(app)
        .post('/rooms/'+chatRoom.id+'/polls')
        .auth(user.email, user.password)
        .expect(401, done);
    });

    it("requires a valid room", function (done) {
        request(app)
        .post('/rooms/2/polls')
        .auth(presenter.email, presenter.password)
        .send({ question: pres_question })
        .expect(400, done);
    })

    it("requires a question", function (done) {
        request(app)
        .post('/rooms/'+chatRoom.id+'/polls')
        .auth(presenter.email, presenter.password)
        .send()
        .expect(400, done);
    });
});

describe('POST /rooms/:room_id/close', function () {
    var user = {
        id: null,
        email: 'user@example.com',
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

     var presenter2 = {
        id: null,
        email: 'presenter2@example.com',
        password: 'test',
        verified: true,
        presenter: true
    };

    beforeEach('delete the users if they exist', function (done) {
        database.query(
            'DELETE FROM users WHERE email IN ($1, $2, $3)',
            [user.email, presenter.email, presenter2.email]
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

            return testUtil.insertUser(presenter);
        })
        .then(function (presenter_id) {
            presenter.id = presenter_id;

            return testUtil.insertUser(presenter2);
        })
        .then(function (presenter2_id) {
            presenter2.id = presenter2_id
            done();
        })
        .catch(done);
    });

     var invitationList = {
        id: null,
        subject: 'Test Subject',
        presenter: null
	};

    beforeEach('add an invitation list', function (done) {
        invitationList.presenter = presenter.id;

        testUtil.insertInvitationList(invitationList)
        .then(function (invitationList_1_id) {
            invitationList.id = invitationList_1_id;

            done();
        })
        .catch(done);
    });

    var chatRoom = {
        room_name: 'Cat Room',
        invitation_list: null,
        id: null
    };

    beforeEach('add a chat room', function (done) {
        chatRoom.invitation_list = invitationList.id;

        testUtil.insertChatRoom(chatRoom)
        .then(function (roomNumber) {
            chatRoom.id = roomNumber;
            done();
        })
        .catch(done);
    });

    it('closes the chatroom specified ', function(done){
       var goodRoom = chatRoom.id;
       request(app)
       .post('/rooms/'+ goodRoom +'/close')
       .auth(presenter.email, presenter.password)
       .expect('{}')
       .expect('Content-Type', /json/)
       .expect(200)
       .end(function (err) {
           if (err) done(err);
           database.query('SELECT end_timestamp FROM chat_rooms WHERE id = $1',[goodRoom])
           .then(function (results) {
               assert.notEqual(results[0].end_timestamp, null, 'end_timestamp should not be null');
               done();
           })
           .catch(done);
       });
    });

    it('requires the presenter to own the room', function(done){
        var goodRoom = chatRoom.id;
        request(app)
       .post('/rooms/'+ goodRoom +'/close')
       .auth(presenter2.email, presenter2.password)
       .expect(400)
       .end(done);
    });

    it('requires the user at least be a presenter', function(done){
       var goodRoom = chatRoom.id;
       request(app)
       .post('/rooms/'+ goodRoom +'/close')
       .auth(user.email, user.password)
       .expect(401,done);
    });

    it('requires a valid room number', function(done){
        var badRoom = chatRoom.id + 1;
        request(app)
        .post('/rooms/'+ badRoom +'/close')
        .auth(presenter.email, presenter.password)
        .expect(404,done);
    });

    it('requires the room to be open', function (done) {
        database.query("UPDATE chat_rooms SET end_timestamp = $1 WHERE id = $2", [new Date(), chatRoom.id])
        .then(function () {
            request(app)
                .post('/rooms/'+ chatRoom.id +'/close')
                .auth(presenter.email, presenter.password)
                .expect(400)
                .end(done);
        })
        .catch(done);
    });
});
