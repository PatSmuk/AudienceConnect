var database = require('../database');
var auth = require('../auth');

exports.deleteAllUsers = function () {
	return database.query('DELETE FROM users').then(function () {});
}

exports.insertUser = function (email, password, verified, presenter) {
	return auth.hashPassword(password)
	.then(function (hash) {
		return database.query(
			'INSERT INTO users (email, password_hash, verified, presenter) VALUES ($1, $2, $3, $4) RETURNING id',
			[email, hash, verified, presenter]
		);
	})
	.then(function (results) {
		return results[0].id;
	});
}
