/* global describe, beforeEach, it */
var request = require('supertest');
var app = require('../../app');
var database = require('../../database');
var testUtil = require('../testUtil');

describe('POST /polls/:poll_id/vote', function () {
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
            .then(function (results) {
                return chatRoom_1.id = results;

            })
            .then(function () {
                done();
            })
            .catch(done);
    });
    
    
    // this shit works
    var poll = {
        room: null,
        question: 'les?'
    };

    var poll2 = {
        room: null,
        question: 'gay?'
    };

    beforeEach('make poll', function (done) {
        poll.room = chatRoom_1.id;
        poll2.room = chatRoom_1.id;

        testUtil.insertPoll(poll)
            .then(function () {
                return testUtil.insertPoll(poll2);
            })
            .then(function (results) {
                return poll.id = results;

            })
            .then(function (results2) {
                return poll2.id = results2;
            })
            .then(function () {
                done();
            })
            .catch(done);
    });



    var ans = {
        poll_id: null,
        answer: 'yesBITCH'
    };

    var ans2 = {
        poll_id: null,
        answer: 'noBITCH'
    };

    beforeEach('make answer', function (done) {
        ans.poll_id = poll.id;
        console.log("POLL ID IS FUCKING: " + poll.id);
        ans2.poll_id = poll2.id;
        console.log("poll_id INSIDE MAKE ANSWER: " + ans.poll_id);
        console.log("poll_id2 INSIDE MAKE ANSWER: " + ans2.poll_id);
        testUtil.addAnswerToPoll(ans.poll_id, ans.answer)
            .then(function () {
                return testUtil.addAnswerToPoll(ans2.poll_id, ans2.answer);
            })
            .then(function (results) {
                console.log("RESULT 1: " + results);
                return voteAns.answer = results;
            })
            .then(function (results2) {
                console.log("RESULT 2: " + results2);
                return voteAns.answer = results2;
            })
            .then(function () {
                done();
            })
            .catch(done);
    });


    /////////////////////////////////////////////////
  
    var voteAns = {
        poll: ans.poll_id,

        user_id: user.id,
        answer: null
    };
    /*
        var voteAns2 = {
            poll: poll.id,
            user_id: new_user.id,
            answer: ans.poll_id
        };
    */
    it('login to vote', function (done) {

        var poll_id = ans.poll_id;


        console.log("poll_id: " + ans.poll_id);
        console.log("user_id: " + user.id);
        console.log("ans_id: " + voteAns.answer);

        request(app)
            .post('/polls/' + poll_id + '/vote')
            .auth(user.email, user.password)
            .send({ answer: voteAns.answer })
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

});

describe('POST /polls/:poll_id/close', function () {

});
