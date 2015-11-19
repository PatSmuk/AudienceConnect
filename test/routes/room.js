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
	var presenter = {
            id: null,
			email: 'presenter@example.com',
			password: 'test',
			verified: true,
			presenter: true

    };
	 var invitationList = {
			id: null,
			subject: 'Test Subject55'
	};
   
	
     beforeEach('delete all users and add data to the database', function (done) {
		  testUtil.deleteAllUsers().then(function(){
            return testUtil.insertUser(user);
        })
		.then(function(id){
            user.userid = id;
            return id;
        })
		.then(function(){
            return testUtil.insertUser(presenter);
        })
        .then(function(id){
            presenter.id = id;
            return id;
        })
		 .then(function(id){
            return database.query('INSERT INTO invitation_lists (presenter,subject) VALUES ($1,$2) RETURNING id',[presenter.id,invitationList.subject]);
        })
		.then(function(results){
			invitationList.id = results[0].id;
		})
        .then(function(){
            done();
        })
        .catch(done);
        
    });
    
   var goodRoomName = 'room';
    //console.log(goodInvitationList);
    
    it('adds a chat room to the database',function(done){
        
        var goodInvitationList = invitationList.id;
        
        request(app)
        .post('/rooms/')
        .auth(presenter.email,presenter.password)
        .send({roomName:goodRoomName,invitation_list:goodInvitationList})
        .expect('Content-Type', /json/)
        .expect(200,done);
        
    });
    
    it('does not add a chat room if the invitation list does not exist', function(done){
        var badInvitationList = invitationList.id + 1;
        
        request(app)
        .post('/rooms/')
        .auth(presenter.email,presenter.password)
        .send({roomName:goodRoomName,invitation_list:badInvitationList})
        .expect('Content-Type', /json/)
        .expect(400,done);
    });
    
    it('does not let a user that is not a presenter add a chat room',function (done){
        request(app)
        .post('/rooms/')
        .auth(user.email,user.password)
        .expect(401,done);
    });
    
    it('requires a room name', function(done){
        request(app)
        .post('/rooms/')
        .auth(presenter.email,presenter.password)
        .send({invitation_list:invitationList.id})
        .expect(400,done);
    });
     it('requires an invitation list', function(done){
        request(app)
        .post('/rooms/')
        .auth(presenter.email,presenter.password)
        .send({roomName:goodRoomName})
        .expect(400,done);
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
