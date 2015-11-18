/* global describe, beforeEach, it */
var request = require('supertest');
var app = require('../../app');
var database = require('../../database');
var testUtil = require('../testUtil');


describe('GET /rooms/', function () {
    
    var invitationList = {
			id: null,
			subject: 'Test Subject'
	};
    
    
        
    var user = {
        userid: null,
        email: 'user@example.com',
        password: 'test',
        verified: true,
        presenter: false
    };
    
    var user2 = {
         userid: null,
        email: 'user2@example.com',
        password: 'test',
        verified: true,
        presenter: false
    };
    
    var invitationList2 = {
        id: null,
		subject: 'Test Subject2'
    };
    
    
    var presenter = {
            id: null,
			email: 'presenter@example.com',
			password: 'test',
			verified: true,
			presenter: true

    };
    var invitationListMembers = {
        id: null,
        member: null
    };
    
    var chat_room = {
        id: null,
        room_name: 'room',
        start_timestamp: null,
        end_timestamp: null,
        invitation_list: null
    };
    var chat_room2 = {
        id: null,
        room_name: 'room2',
        start_timestamp: null,
        end_timestamp: null,
        invitation_list: null
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
            return database.query('INSERT INTO invitation_lists (presenter,subject) VALUES ($1,$2) RETURNING id',[id,'subject']);
        })
        .then(function(id){
            invitationList.id = id;
            invitationListMembers.id = id;
            invitationListMembers.member = user.userid;
            return database.query('INSERT INTO invitation_list_members VALUES ($1,$2)', [id[0].id,user.userid]);
        })
        .then(function(id){
            chat_room.invitation_list = invitationList.id;
            chat_room.start_timestamp = '2015-11-18T20:47:55+00:00';
            return database.query('INSERT INTO chat_rooms (room_name,start_timestamp,invitation_list) VALUES ($1,$2,$3) RETURNING id',[chat_room.room_name,chat_room.start_timestamp,invitationList.id[0].id])
            
        })
        .then(function(id){
            chat_room.id = id;
            return id;
        })
        .then(function(){
            return testUtil.insertUser(user2);
        })
        .then(function(id){
            user2.id = id;
           
            return id;
        })
        .then(function(id){
            return database.query('INSERT INTO invitation_lists (presenter,subject) VALUES ($1,$2) RETURNING id',[presenter.id,'subject']);
        })
        .then(function (id){
            invitationList2.id = id;
            return id;
        })
        .then(function(){
            chat_room2.invitation_list = invitationList2.id;
            chat_room2.start_timestamp = '2015-11-18T20:47:55+00:00';
            return database.query('INSERT INTO chat_rooms (room_name,start_timestamp,invitation_list) VALUES ($1,$2,$3) RETURNING id',[chat_room2.room_name,chat_room.start_timestamp,invitationList2.id[0].id])
        })
        .then(function(){
            done();
        }).catch(done);
    });


    it('returns a list of rooms associated with the user', function (done) {
        
        request(app)
            .get('/rooms/')
            .auth(user.email,user.password)
            .expect('Content-Type', /json/)
            .expect(200,done);  
            
    });
    
    it("returns only the rooms the user belongs to",function(done){
       request(app)
       .get('/rooms/')
       .auth(user.email,user.password)
       .expect(function(results){
           //should be only one chat room for the user1
           if(results.body.length != 1) return "not correct number of rooms";
       })
       .end(done);
    });
    
    it('requires valid credentials', function(done){
        request(app)
            .get('/rooms/')
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
    
    it('returns zero rooms for a user that just registered',function(done){
        request(app)
        .get('/rooms/')
        .auth(user2.email,user2.password)
        .expect('[]',done);
    });
    
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
