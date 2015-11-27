var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;
var EventEmitter = require('events').EventEmitter;
var request = require('superagent');
var LoginStore = require('./LoginStore');
var InvitationListActionCreators = require('../actions/InvitationListActionCreators');


var _invitationLists = {};
var CHANGE_EVENT = 'change';

var InvitationListStore = Object.assign({}, EventEmitter.prototype, {

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
        return Object.keys(_invitationLists);
    },

    getInvitationList: function (id) {
        return _invitationLists[id];
    }
});


Dispatcher.register(function (action) {

    switch (action.type) {

        case ActionTypes.RECEIVE_INVITATION_LISTS: {
            action.invitationLists.forEach(function (list) {
                _invitationLists[list.id] = list;
                InvitationListActionCreators.fetchInvitationList(list.id);
            });

            InvitationListStore.emitChange();
            break;
        }

        case ActionTypes.RECEIVE_INVITATION_LIST: {
            _invitationLists[action.list_id].users = action.users;

            InvitationListStore.emitChange();
            break;
        }
    }
});

module.exports = InvitationListStore;
