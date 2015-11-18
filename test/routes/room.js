/* global describe, beforeEach, it */
var request = require('supertest');
var app = require('../../app');
var database = require('../../database');


describe('GET /rooms/', function () {
	
	beforeEach('delete all users and add data to the database', function (done) {
        database.getClient(function (err, client, queryDone) {
            if (err) return done(err);
            var 
            database.query('DELETE FROM users', function (err) {
                queryDone();
                done(err);
            });
			database.query("INSERT INTO users (id,verified,presenter,email,password_hash,student_id,full_name)" 
 			+ " VALUES (1,true,false,'jason@lol.com','$2a$10$sBL3CYJwA.tADgLRsm0QMesAjOB3.vnsO2Whf7qPyJcK.Wt5qkZYi',100529393,'Jason R')", function (err) {
                queryDone();
                done(err);
            });
        });
    });
	
	
	it('returns a list of rooms associated with the user',function(done){
		request(app)
			.get('/rooms/')
			.expect('Content-Type', [{}]);
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
