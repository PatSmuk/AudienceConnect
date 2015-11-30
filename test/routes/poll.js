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

    beforeEach('delete the users if they exist', function (done) {
        database().then(function (client) {
            client[0].query(
                'DELETE FROM users WHERE email IN ($1, $2, $3)',
                [user.email, new_user.email, presenter.email]
            )
            .then(function () {
                client[1]();
                done();
            })
            .catch(function (err) { client[1](); throw err; });
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


    beforeEach('add the first user to the invitation list', function (done) {
        testUtil.addUserToInvitationList(invitationList_1.id, user.id)
        .then(done)
        .catch(done);
    });


    var chatRoom_1 = {
        id: null,
        room_name: 'Cat Room',
        invitation_list: null
    };

    beforeEach('add a chat room', function (done) {
        chatRoom_1.invitation_list = invitationList_1.id;

        testUtil.insertChatRoom(chatRoom_1)
        .then(function (chat_room_1_id) {
            chatRoom_1.id = chat_room_1_id;
            done();
        })
        .catch(done);
    });


    // this works
    var poll = {
        id: null,
        room: null,
        question: 'les?'
    };

    beforeEach('make a poll', function (done) {
        poll.room = chatRoom_1.id;

        testUtil.insertPoll(poll)
        .then(function (poll_1_id) {
            poll.id = poll_1_id;
            done();
        })
        .catch(done);
    });

    var ans = {
        id: null,
        answer: 'yesBITCH'
    };

    beforeEach('make an answer', function (done) {
        testUtil.addAnswerToPoll(poll.id, ans.answer)
        .then(function (answer_1_id) {
            ans.id = answer_1_id;
            done();
        })
        .catch(done);
    });

    //testing vote no auth
    it('requires authentication', function (done) {
        request(app)
        .post('/polls/' + poll.id + '/vote')
        .send({ answer: ans.id })
        .expect('Content-Type', /json/)
        .expect(401, done)
    });

    it("requires the poll to exist", function (done) {
        request(app)
        .post('/polls/' + (poll.id + 1) + '/vote')
        .auth(user.email, user.password)
        .send({ answer: ans.id })
        .expect('Content-Type', /json/)
        .expect(404, done)
    });

    //this tests the voting system
    it('allows audience members to vote', function (done) {
        request(app)
        .post('/polls/' + poll.id + '/vote')
        .auth(user.email, user.password)
        .send({ answer: ans.id })
        .expect('Content-Type', /json/)
        .expect(200, done)
    });

    it('allows presenters to vote', function (done) {
        request(app)
        .post('/polls/' + poll.id + '/vote')
        .auth(presenter.email, presenter.password)
        .send({ answer: ans.id })
        .expect('Content-Type', /json/)
        .expect(200, done)
    });

    it("doesn't allow uninvited people to vote", function (done) {
        request(app)
        .post('/polls/' + poll.id + '/vote')
        .auth(new_user.email, new_user.password)
        .send({ answer: ans.id })
        .expect('Content-Type', /json/)
        .expect(404, done)
    });

    //this tests the duplicate votes
    it("doesn't allow duplicate votes", function (done) {
        database().then(function (client) {
            client[0].query("INSERT INTO poll_votes (poll, user_id, answer) VALUES ($1, $2, $3)", [poll.id, user.id, ans.id])
            .then(function () {
                client[1]();

                request(app)
                .post('/polls/' + poll.id + '/vote')
                .auth(user.email, user.password)
                .send({ answer: ans.id })
                .expect('Content-Type', /json/)
                .expect(400)
                .end(done);
            })
            .catch(function (err) { client[1](); throw err; });
        })
        .catch(done);
    });

    //this checks if the body is undefined
    it('requires an answer in the request body', function (done) {
        request(app)
        .post('/polls/' + poll.id + '/vote')
        .auth(user.email, user.password)
        .send({})
        .expect('Content-Type', /json/)
        .expect(400, done)
    });

    it("doesn't allow voting in closed polls", function (done) {
        database().then(function (client) {
            client[0].query('UPDATE polls SET end_timestamp = $1 WHERE id = $2', [new Date(), poll.id])
            .then(function () {
                client[1]();

                request(app)
                .post('/polls/' + poll.id + '/vote')
                .auth(user.email, user.password)
                .expect('Content-Type', /json/)
                .expect(400, done);
            })
            .catch(function (err) { client[1](); throw err; });
        })
        .catch(done);
    });
});

describe('POST /polls/:poll_id/close', function () {

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
        id: null,
        room_name: 'Cat Room',
        invitation_list: null
    };

    beforeEach('add two chat rooms', function (done) {
        chatRoom_1.invitation_list = invitationList_1.id;

        testUtil.insertChatRoom(chatRoom_1)
        .then(function (chatRoom_1_id) {
            chatRoom_1.id = chatRoom_1_id;
            done();
        })
        .catch(done);
    });

    var poll = {
        room: null,
        question: 'les?'
    };

    beforeEach('make poll', function (done) {
        poll.room = chatRoom_1.id;
        testUtil.insertPoll(poll)
        .then(function (poll_id) {
            poll.id = poll_id;
            done();
        })
        .catch(done);
    });

    var ans = {
        id: null,
        answer: 'yesBITCH'
    };

    beforeEach('make answer', function (done) {
        testUtil.addAnswerToPoll(poll.id, ans.answer)
        .then(function (answer_id) {
            ans.id = answer_id;
            done();
        })
        .catch(done);
    });

    //testing no auth close
    it('requires authentication', function (done) {
        request(app)
        .post('/polls/' + poll.id + '/close')
        .expect('Content-Type', /json/)
        .expect(401, done)
    });

    //close the vote if you are presenter
    it('allows the presenter to close their polls', function (done) {
        request(app)
        .post('/polls/' + poll.id + '/close')
        .auth(presenter.email, presenter.password)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err) {
            if (err) done(err);

            database().then(function (client) {
                client[0].query("SELECT end_timestamp FROM polls WHERE id = $1", [poll.id])
                .then(function (results) {
                    client[1]();
                    if (results.rows[0].end_timestamp === null)
                        return "The poll didn't get closed, end_timestamp is still NULL";
                    done();
                })
                .catch(function (err) { client[1](); throw err; });
            })
            .catch(done);
        });
    });

    it('requires that you own the poll', function (done) {
        var presenter_2 = {
            email: 'other_presenter@example.com',
            password: 'test',
            verified: true,
            presenter: true
        }

        testUtil.insertUser(presenter_2)
        .then(function () {
            request(app)
            .post('/polls/' + poll.id + '/close')
            .auth(presenter_2.email, presenter_2.password)
            .expect('Content-Type', /json/)
            .expect(404)
            .end(done);
        });
    });

    //close the vote if you are NOT presenter
    it('requires you to be a presenter', function (done) {
        request(app)
        .post('/polls/' + poll.id + '/close')
        .auth(user.email, user.password)
        .expect('Content-Type', /json/)
        .expect(403, done);
    });

    //poll id DNE
    it('requires the poll to exist', function (done) {
        request(app)
        .post('/polls/' + (poll.id + 1) + '/close')
        .auth(presenter.email, presenter.password)
        .expect('Content-Type', /json/)
        .expect(404, done);
    });

    it("doesn't allow closing the same poll twice", function (done) {
        database().then(function (client) {
            client[0].query('UPDATE polls SET end_timestamp = $1 WHERE id = $2', [new Date(), poll.id])
            .then(function () {
                client[1]();
                request(app)
                .post('/polls/' + poll.id + '/close')
                .auth(presenter.email, presenter.password)
                .expect('Content-Type', /json/)
                .expect(400, done);
            })
            .catch(function (err) { client[1](); throw err; });
        })
        .catch(done);
    });
});
