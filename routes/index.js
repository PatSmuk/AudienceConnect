var express = require('express');
var router = express.Router();
var validator = require('validator');
var assert = require('assert');
var database = require('../database');
var bcrypt = require('bcryptjs');
var Promise = require('bluebird');
var auth = require('../auth');

/*
 * GET /
 *
 * Minimum access level: everyone
 *
 * Send the web app to the user.
 */
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

/*
 * POST /register
 *
 * Registers a new user account.
 *
 * Parameters:
 *  - email: a valid email address that is not already in use
 *  - password: a string that is 1 to 32 characters long
 */
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

    database().then(function (client) {
        return client[0].query("SELECT * FROM users WHERE email = $1", [email]).then(function (results) {
            if (results.rowCount > 0) {
                return res.status(400).json({errors: [{param: 'email', msg: 'Email already in use', value: email}]});
            }

            return auth.hashPassword(password).then(function (hash) {
                return client[0].query("INSERT INTO users (email, password_hash) VALUES ($1, $2)", [email, hash]);
            })
            .then(function () {
                res.json({});
            });
        })
        .catch(function (err) { client[1](); next(err); });
    })
    .catch(next);
});

module.exports = router;
