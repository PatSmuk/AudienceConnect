var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;
var LoginStore = require('../stores/LoginStore');

var request = require('superagent');

var ChatRoomActionCreators = {

    fetchChatRooms: function (email, password) {
        request
        .get('/rooms/')
        .auth(email, password)
        .end(function (err, res) {
            if (err) {
                console.error(err);
                console.dir(res.body);
                return;
            }
            ChatRoomActionCreators.receiveChatRooms(res.body);
        });
    },

    receiveChatRooms: function (chatRooms) {
        Dispatcher.dispatch({
            type: ActionTypes.RECEIVE_CHAT_ROOMS,
            chatRooms: chatRooms
        });
    },

    addChatRoom: function (roomName, invitationList) {
        request
        .post('/rooms/')
        .auth(LoginStore.getEmail(), LoginStore.getPassword())
        .send({ roomName: roomName, invitationList: invitationList })
        .end(function (err, res) {
            if (err) {
                console.error(err);
                console.dir(res.body);
                return;
            }
            ChatRoomActionCreators.fetchChatRooms(LoginStore.getEmail(), LoginStore.getPassword());
        });
    },

    fetchMessages: function (room_id) {
        request
        .get('/rooms/'+room_id+'/messages/')
        .auth(LoginStore.getEmail(), LoginStore.getPassword())
        .end(function (err, res) {
            if (err) {
                console.error(err);
                console.dir(res.body);
                return;
            }
            ChatRoomActionCreators.receiveMessages(room_id, res.body);
        });
    },

    receiveMessages: function (room_id, messages) {
        Dispatcher.dispatch({
            type: ActionTypes.RECEIVE_CHAT_MESSAGES,
            room_id: room_id,
            messages: messages
        });
    },

    sendMessage: function (room_id, message) {
        request
        .post('/rooms/'+room_id+'/messages/')
        .auth(LoginStore.getEmail(), LoginStore.getPassword())
        .send({ message: message })
        .end(function (err, res) {
            if (err) {
                console.error(err);
                console.dir(res.body);
                return;
            }
            ChatRoomActionCreators.fetchMessages(room_id);
        });
    },

    fetchPolls: function (room_id) {
        request
        .get('/rooms/'+room_id+'/polls/')
        .auth(LoginStore.getEmail(), LoginStore.getPassword())
        .end(function (err, res) {
            if (err) {
                console.error(err);
                console.dir(res.body);
                return;
            }
            ChatRoomActionCreators.receivePolls(room_id, res.body);
        });
    },

    receivePolls: function (room_id, polls) {
        Dispatcher.dispatch({
            type: ActionTypes.RECEIVE_POLLS,
            room_id: room_id,
            polls: polls
        });
    },

    vote: function (room_id, poll_id, answer_id) {
        request
        .post('/polls/'+poll_id+'/vote')
        .auth(LoginStore.getEmail(), LoginStore.getPassword())
        .send({ answer: answer_id })
        .end(function (err, res) {
            if (err) {
                console.error(err);
                console.dir(res.body);
                return;
            }
            ChatRoomActionCreators.fetchPolls(room_id);
        });
    },

    addPoll: function (room_id, question, answers) {
        request
        .post('/rooms/'+room_id+'/polls')
        .auth(LoginStore.getEmail(), LoginStore.getPassword())
        .send({ question: question, answers: answers })
        .end(function (err, res) {
            if (err) {
                console.error(err);
                console.dir(res.body);
                return;
            }
            ChatRoomActionCreators.fetchPolls(room_id);
        });
    }
};

module.exports = ChatRoomActionCreators;
