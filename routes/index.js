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
    req.checkBody('email', 'Email address is missing').notEmpty();
    req.checkBody('email', 'Email address is invalid').isEmail();
    req.checkBody('password', 'Password is missing').notEmpty();
    req.checkBody('password', 'Password must be between 1 and 32 characters long').isLength(1, 32);
    
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({errors: errors});
    }
    
    var email = req.body.email;
    var password = req.body.password;
    
    database.getClient(function (err, client) {
        if (err) return next(err);
        
        client.query("SELECT * FROM users WHERE email = $1", [email], function (err, results) {
            if (err) return next(err);
            
            if (results.rowCount > 0) {
                return res.status(400).json({errors: [{param: 'email', msg: 'Email already in use', value: email}]});
            }
            
            bcrypt.genSalt(10, function (err, salt) {
                if (err) return next(err);
                
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) return next(err);
                    
                    client.query("INSERT INTO users (email, password_hash) VALUES ($1, $2)", [email, hash], function (err) {
                        if (err) return next(err);
                        return res.json({});
                    });
                });
            });
        });
    });
});

module.exports = router;
