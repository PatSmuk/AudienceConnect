var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;

var request = require('superagent');

var ChatRoomActionCreators = {

    fetchChatRooms: function (email, password) {
        request
        .get('/rooms/')
        .auth(email, password)
        .end(function (err, res) {
            if (err) {
                console.error(err);
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
    }
};

module.exports = ChatRoomActionCreators;
