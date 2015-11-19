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
});

describe('POST /polls/:poll_id/close', function () {

});
