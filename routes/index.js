var express = require('express');
var router = express.Router();
var validator = require('validator');
var assert = require('assert');
var database = require('../database');
var bcrypt = require('bcryptjs');

/* GET home page. */

router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

router.post('/register', function (req, res, next) {
    function sendError(message, status) {
        res.status(status ? status : 400);
        res.json({error: message});
    }
    
    var email = req.body.email;
    var password = req.body.password;
    
    if (!validator.isEmail(email)) {
        return sendError('The "email" field was missing or not an email.');
    }
    
    if (typeof password != 'string') {
        return sendError('The "password" field was missing or not a string.');
    }
    
    if (!validator.isLength(password, 1, 32)) {
        return sendError('The "password" field was over 32 characters long.');
    }
    
    database.getClient(function (err, client) {
        if (err) return next(err);
        
        client.query("SELECT * FROM users WHERE email = $1", [email], function (err, results) {
            if (err) return next(err);
            
            if (results.rowCount > 0) {
                return sendError('The email supplied is already registered.');
            }
            
            bcrypt.genSalt(10, function (err, salt) {
                if (err) return next(err);
                
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) return next(err);
                    
                    client.query("INSERT INTO users (email, password_hash) VALUES ($1, $2)", [email, hash], function (err) {
                        if (err) return next(err);
                        res.json({error: ''});
                    });
                });
            });
        });
    });
});

module.exports = router;
