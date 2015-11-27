var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;
var EventEmitter = require('events').EventEmitter;
var request = require('superagent');
var LoginStore = require('./LoginStore');
var ChatRoomActionCreators = require('../actions/ChatRoomActionCreators');


var _chatRooms = {};

var CHANGE_EVENT = 'change';

var ChatRoomStore = Object.assign({}, EventEmitter.prototype, {

    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    getAll: function () {
        return Object.keys(_chatRooms);
    },

    getChatRoom: function (room_id) {
        var room = _chatRooms[room_id];

        if (!room.messages) {
            ChatRoomActionCreators.fetchMessages(room_id);
        }

        return room;
    }
});


Dispatcher.register(function (action) {

    switch (action.type) {

        case ActionTypes.RECEIVE_CHAT_ROOMS: {
            action.chatRooms.forEach(function (chatRoom) {
                if (!_chatRooms[chatRoom.id]) {
                    _chatRooms[chatRoom.id] = chatRoom;
                }
            });

            ChatRoomStore.emitChange();
            break;
        }

        case ActionTypes.RECEIVE_CHAT_MESSAGES: {
            _chatRooms[action.room_id].messages = action.messages;
            ChatRoomStore.emitChange();
            break;
        }
    }
});

module.exports = ChatRoomStore;
