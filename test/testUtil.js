var database = require('../database');
var auth = require('../auth');

exports.insertUser = function (user) {
    return database.query('DELETE FROM users WHERE email = $1', [user.email])
    .then(function () {
        return auth.hashPassword(user.password);
    })
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


exports.insertChatRoom = function (chatRoom) {
    return database.query(
        'INSERT INTO chat_rooms (room_name, invitation_list) VALUES ($1, $2) RETURNING id',
        [chatRoom.room_name, chatRoom.invitation_list]
    )
    .then(function (results) {
        return results[0].id;
    });
}


exports.insertInvitationList = function (invitationList) {
    return database.query(
        'INSERT INTO invitation_lists (presenter, subject) VALUES ($1, $2) RETURNING id',
        [invitationList.presenter, invitationList.subject]
    )
    .then(function (results) {
        return results[0].id;
    });
}


exports.addUserToInvitationList = function (invitation_list_id, user_id) {
    return database.query(
        'DELETE FROM invitation_list_members WHERE invitation_list = $1 AND audience_member = $2',
        [invitation_list_id, user_id]
    )
    .then(function () {
        return database.query(
            'INSERT INTO invitation_list_members (invitation_list, audience_member) VALUES ($1, $2)',
            [invitation_list_id, user_id]
        );
    })
    .then(function () {}); // Suppress the empty array from database.query.
}


exports.insertMessage = function (message) {
    return database.query(
        'INSERT INTO messages (sender, room, message_text) VALUES ($1, $2, $3) RETURNING id',
        [message.sender, message.room, message.message_text]
    )
    .then(function (results) {
        return results[0].id;
    });
}


exports.insertPoll = function (poll) {
    return database.query(
        'INSERT INTO polls (room, question) VALUES ($1, $2) RETURNING id',
        [poll.room, poll.question]
    )
    .then(function (results) {
        return results[0].id;
    });
}


exports.addAnswerToPoll = function (poll_id, answer) {
    return database.query(
        'INSERT INTO poll_answers (poll, answer) VALUES ($1, $2) RETURNING id',
        [poll_id, answer]
    )
    .then(function (results) {
        return results[0].id;
    });
}


exports.insertVote = function (vote) {
    return database.query(
        'DELETE FROM poll_votes WHERE poll = $1 AND user_id = $2',
        [vote.poll, vote.user_id]
    )
    .then(function () {
        return database.query(
            'INSERT INTO poll_votes (poll, user_id, answer) VALUES ($1, $2)',
            [vote.poll, vote.user_id, vote.answer]
        );
    })
    .then(function () {}); // Suppress the empty array from database.query.
}