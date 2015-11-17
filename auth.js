var auth = require('basic-auth');
var database = require('./database');
var bcrypt = require('bcryptjs');
var assert = require('assert');

exports.requireLevel = function (level) {
    assert(level == 'logged_in' || level == 'presenter', 'Invalid access level: ' + level);
    
    return function (req, res, next) {
        var credentials = auth(req);
        
        function invalidCredentials() {
            res.status(401).send('Valid credentials are required');
        }
        
        // If credentials are missing, return error.
        if (!credentials) {
            return invalidCredentials();
        }
        
        database.getClient(function (err, client) {
            if (err) return next(err);
            
            var email = credentials.name;
            var password = credentials.pass;
            
            client.query(
                "SELECT id, avatar, verified, presenter, email, password_hash, student_id "+
                "FROM users WHERE email = $1",
                [email],
                function (err, results) {
                    if (err) return next(err);
                    
                    // If account does not exist, return error.
                    if (results.rowCount != 1) {
                        return invalidCredentials();
                    }
                    
                    var user = results.rows[0];
                    var hash = user.password_hash;
                    var verified = user.verified;
                    var presenter = user.presenter;
    
                    // If the account has not been verified, return error.
                    if (!verified) {
                        return invalidCredentials();
                    }
                    
                    bcrypt.compare(password, hash, function (err, valid) {
                        if (err) return next(err);
                        
                        // If the password supplied is not correct, return error.
                        if (!valid) {
                            return invalidCredentials();
                        }
                        
                        // If the access level is 'presenter' and they are not a presenter, return error.
                        if (level == 'presenter' && !presenter) {
                            return invalidCredentials();
                        }
                        
                        req.user = user;
                        next();
                    });
                });
        });
    }
}
