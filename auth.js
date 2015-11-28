var auth = require('basic-auth');
var database = require('./database');
var bcrypt = require('bcryptjs');
var assert = require('assert');
var Promise = require('bluebird');

var checkPassword = Promise.promisify(bcrypt.compare);

exports.requireLevel = function (level) {
    assert(level == 'logged_in' || level == 'presenter', 'Invalid access level: ' + level);

    return function (req, res, next) {
        var credentials = auth(req);

        function invalidCredentials() {
            res.status(401).json({ error: 'Valid credentials are required' });
        }

        // If credentials are missing, return error.
        if (!credentials) {
            return invalidCredentials();
        }

        var email = credentials.name;
        var password = credentials.pass;

        database().then(function (client) {
            return client[0].query(
                "SELECT verified, presenter, password_hash, * FROM users WHERE email = $1",
                [email])
            .then(function (results) {
                client[1]();

                // If account does not exist, return error.
                if (results.rowCount == 0) {
                    return invalidCredentials();
                }

                var user = results.rows[0];

                // If the account has not been verified, return error.
                if (!user.verified) {
                    return invalidCredentials();
                }

                return checkPassword(password, user.password_hash).then(function (valid) {
                    // If the password supplied is not correct, return error.
                    if (!valid) {
                        return invalidCredentials();
                    }

                    // If the access level is 'presenter' and they are not a presenter, return error.
                    if (level == 'presenter' && !user.presenter) {
                        return res.status(403).json({ error: 'Greater access required' });
                    }

                    req.user = user;
                    next();
                });
            })
            .catch(function (err) { client[1](); next(err); });
        })
        .catch(next);
    }
}

var genSalt = Promise.promisify(bcrypt.genSalt);
var hash = Promise.promisify(bcrypt.hash);

exports.hashPassword = function (password) {
    return genSalt(2).then(function (salt) {
        return hash(password, salt);
    });
}
