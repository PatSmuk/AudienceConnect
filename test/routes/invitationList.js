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
			return database().then(function (client) {
                return client[0].query(
                    'INSERT INTO invitation_lists (presenter, subject) VALUES ($1, $2) RETURNING id',
                    [id, invitationList.subject]
                )
                .then(function (results) {
                    client[1]();
                    invitationList.id = results.rows[0].id;

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
                .catch(function (err) { client[1](); throw err; });
            });
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
            .expect(403, done);
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
            .expect(403, done);
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
    var other_presenter = {
        id: null,
        email: 'user@example.com',
        password: 'test',
        verified: true,
        presenter: true
    }
    var user = {
        id: null,
        email: 'some_guy@example.com',
        password: 'test',
        verified: true,
        presenter: false
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

    beforeEach('add another presenter', function (done) {
        testUtil.insertUser(other_presenter)
        .then(function (other_presenter_id) {
            other_presenter.id = other_presenter_id;
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
        .auth(other_presenter.email, other_presenter.password)
        .expect(404)
        .end(done);
    });

    it("requires the user to be a presenter", function (done) {
        request(app)
        .get('/invitationLists/'+list.id+'/')
        .auth(user.email, user.password)
        .expect(403)
        .end(done);
    });
});


describe('POST /invitationLists/:list_id/', function () {

    var presenter = {
        id: null,
        email: 'presenter@example.com',
        password: 'test',
        verified: true,
        presenter: true
    };
    var other_presenter = {
        id: null,
        email: 'user@example.com',
        password: 'test',
        verified: true,
        presenter: true
    }
    var user = {
        id: null,
        email: 'some_guy@example.com',
        password: 'test',
        verified: true,
        presenter: false
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

    beforeEach('add another presenter', function (done) {
        testUtil.insertUser(other_presenter)
        .then(function (other_presenter_id) {
            other_presenter.id = other_presenter_id;
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

    it("allows a presenter to add a user to one of his invitation lists", function (done) {
        request(app)
        .post('/invitationLists/'+list.id+'/')
        .auth(presenter.email, presenter.password)
        .send({ user_id: user.id })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect('{}')
        .end(function (err) {
            if (err) done(err);

            database().then(function (client) {
                return client[0].query("SELECT * FROM invitation_list_members WHERE invitation_list = $1", [list.id])
                .then(function (results) {
                    client[1]();
                    if (results.rowCount != 1) {
                        return 'Expected one person on the invitation list';
                    }
                    done();
                })
                .catch(function (err) { client[1](); done(err); })
            });
        });
    });

    it("requires the presenter to own the invitation list", function (done) {
        request(app)
        .post('/invitationLists/'+list.id+'/')
        .auth(other_presenter.email, other_presenter.password)
        .send({ user_id: user.id })
        .expect(404)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it("requires credentials", function (done) {
        request(app)
        .post('/invitationLists/'+list.id+'/')
        .send({ user_id: user.id })
        .expect(401)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it("requires the user to be a presenter", function (done) {
        request(app)
        .post('/invitationLists/'+list.id+'/')
        .auth(user.email, user.password)
        .send({ user_id: user.id })
        .expect(403)
        .expect('Content-Type', /json/)
        .end(done);
    });
});


describe('DELETE /invitationLists/:list_id/:user_id/', function () {

    var presenter = {
        id: null,
        email: 'presenter@example.com',
        password: 'test',
        verified: true,
        presenter: true
    };
    var other_presenter = {
        id: null,
        email: 'user@example.com',
        password: 'test',
        verified: true,
        presenter: true
    }
    var user = {
        id: null,
        email: 'some_guy@example.com',
        password: 'test',
        verified: true,
        presenter: false
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

    beforeEach('add another presenter', function (done) {
        testUtil.insertUser(other_presenter)
        .then(function (other_presenter_id) {
            other_presenter.id = other_presenter_id;
            done();
        })
        .catch(done);
    });

    beforeEach('add an invitation list belonging to presenter', function (done) {
        list.presenter = presenter.id;

        testUtil.insertInvitationList(list)
        .then(function (list_id) {
            list.id = list_id;
            done();
        })
        .catch(done);
    });

    beforeEach('add the user to the invitation list', function (done) {
        testUtil.addUserToInvitationList(list.id, user.id).then(done).catch(done);
    });

    it("allows a presenter to remove someone from one of their invitation lists", function (done) {
        request(app)
        .delete('/invitationLists/'+list.id+'/'+user.id+'/')
        .auth(presenter.email, presenter.password)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect('{}')
        .end(function (err) {
            if (err) done(err);

            database().then(function (client) {
                return client[0].query("SELECT * FROM invitation_list_members WHERE invitation_list = $1", [list.id])
                .then(function (results) {
                    if (results.rowCount != 0) {
                        return 'Expected zero people on the invitation list';
                    }
                    done();
                })
                .catch(function (err) { client[1](); done(err); });
            });
        });
    });

    it("requires credentials", function (done) {
        request(app)
        .delete('/invitationLists/'+list.id+'/'+user.id+'/')
        .expect(401)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it("requires the user to be a presenter", function (done) {
        request(app)
        .delete('/invitationLists/'+list.id+'/'+user.id+'/')
        .auth(user.email, user.password)
        .expect(403)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it("requires the user to own the list", function (done) {
        request(app)
        .delete('/invitationLists/'+list.id+'/'+user.id+'/')
        .auth(other_presenter.email, other_presenter.password)
        .expect(404)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it("requires the list to exist", function (done) {
        request(app)
        .delete('/invitationLists/'+(list.id + 1)+'/'+user.id+'/')
        .auth(other_presenter.email, other_presenter.password)
        .expect(404)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it("requires the user to be on the list", function (done) {
        request(app)
        .delete('/invitationLists/'+list.id+'/'+(user.id + 1)+'/')
        .auth(other_presenter.email, other_presenter.password)
        .expect(404)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it("requires a list ID", function (done) {
        request(app)
        .delete('/invitationLists/null/'+user.id+'/')
        .auth(other_presenter.email, other_presenter.password)
        .expect(400)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it("requires a user ID", function (done) {
        request(app)
        .delete('/invitationLists/'+list.id+'/null/')
        .auth(other_presenter.email, other_presenter.password)
        .expect(404)
        .expect('Content-Type', /json/)
        .end(done);
    });
});
