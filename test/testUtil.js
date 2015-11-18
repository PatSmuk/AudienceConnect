var database = require('../database');
var auth = require('../auth');

exports.deleteAllUsers = function () {
	return database.query('DELETE FROM users').then(function () {});
}

exports.insertUser = function (user) {
	return auth.hashPassword(user.password)
	.then(function (hash) {
		return database.query(
			'INSERT INTO users (email, password_hash, verified, presenter) VALUES ($1, $2, $3, $4) RETURNING id',
			[user.email, hash, user.verified, user.presenter]
		);
	})
	.then(function (results) {
		return results[0].id;
	});
}
