var database = require('../database');
var auth = require('../auth');


exports.insertUser = function (user) {
    return database().then(function (client) {
        var user_id;
        return client[0].query('DELETE FROM users WHERE email = $1', [user.email])
        .then(function () {
            return auth.hashPassword(user.password);
        })
        .then(function (hash) {
            return client[0].query(
                'INSERT INTO users (email, password_hash, verified, presenter) VALUES ($1, $2, $3, $4) RETURNING id',
                [user.email, hash, user.verified, user.presenter]
            );
        })
        .then(function (results) {
            client[1]();
            user_id = results.rows[0].id;
        })
        .catch(function (err) { client[1](); throw err; })
        .then(function () {
            return user_id;
        });
    });
}


exports.insertChatRoom = function (chatRoom) {
    return database().then(function (client) {
        var room_id;
        return client[0].query(
            'INSERT INTO chat_rooms (room_name, invitation_list) VALUES ($1, $2) RETURNING id',
            [chatRoom.room_name, chatRoom.invitation_list]
        )
        .then(function (results) {
            client[1]();
            room_id = results.rows[0].id;
        })
        .catch(function (err) { client[1](); throw err; })
        .then(function () {
            return room_id;
        });
    });
}


exports.insertInvitationList = function (invitationList) {
    return database().then(function (client) {
        var list_id;
        return client[0].query(
            'INSERT INTO invitation_lists (presenter, subject) VALUES ($1, $2) RETURNING id',
            [invitationList.presenter, invitationList.subject]
        )
        .then(function (results) {
            client[1]();
            list_id = results.rows[0].id;
        })
        .catch(function (err) { client[1](); throw err; })
        .then(function () {
            return list_id;
        });
    });
}


exports.addUserToInvitationList = function (invitation_list_id, user_id) {
    return database().then(function (client) {
        return client[0].query(
            'DELETE FROM invitation_list_members WHERE invitation_list = $1 AND audience_member = $2',
            [invitation_list_id, user_id]
        )
        .then(function () {
            return client[0].query(
                'INSERT INTO invitation_list_members (invitation_list, audience_member) VALUES ($1, $2)',
                [invitation_list_id, user_id]
            );
        })
        .then(function () { client[1](); })
        .catch(function (err) { client[1](); throw err; });
    });
}


exports.insertMessage = function (message) {
    return database().then(function (client) {
        var message_id;
        return client[0].query(
            'INSERT INTO messages (sender, room, message_text) VALUES ($1, $2, $3) RETURNING id',
            [message.sender, message.room, message.message_text]
        )
        .then(function (results) {
            client[1]();
            message_id = results.rows[0].id;
        })
        .catch(function (err) { client[1](); throw err; })
        .then(function () {
            return message_id;
        });
    });
}


exports.insertPoll = function (poll) {
    return database().then(function (client) {
        var poll_id;
        return client[0].query(
            'INSERT INTO polls (room, question) VALUES ($1, $2) RETURNING id',
            [poll.room, poll.question]
        )
        .then(function (results) {
            client[1]();
            poll_id = results.rows[0].id;
        })
        .catch(function (err) { client[1](); throw err; })
        .then(function () {
            return poll_id;
        });
    });
}


exports.addAnswerToPoll = function (poll_id, answer) {
    return database().then(function (client) {
        var answer_id;
        return client[0].query(
            'INSERT INTO poll_answers (poll, answer) VALUES ($1, $2) RETURNING id',
            [poll_id, answer]
        )
        .then(function (results) {
            client[1]();
            answer_id = results.rows[0].id;
        })
        .catch(function (err) { client[1](); throw err; })
        .then(function () {
            return answer_id;
        });
    });
}


exports.insertVote = function (vote) {
    return database().then(function (client) {
        return client[0].query(
            'DELETE FROM poll_votes WHERE poll = $1 AND user_id = $2',
            [vote.poll, vote.user_id]
        )
        .then(function () {
            return client[0].query(
                'INSERT INTO poll_votes (poll, user_id, answer) VALUES ($1, $2, $3)',
                [vote.poll, vote.user_id, vote.answer]
            );
        })
        .then(function () { client[1](); })
        .catch(function (err) { client[1](); throw err; });
    });
}
