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
    }
};

module.exports = ChatRoomActionCreators;
