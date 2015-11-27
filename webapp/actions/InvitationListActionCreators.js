var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;
var LoginStore = require('../stores/LoginStore');

var request = require('superagent');

var InvitationListActionCreators = {

    fetchInvitationLists: function (email, password) {
        request
        .get('/invitationLists/')
        .auth(email, password)
        .end(function (err, res) {
            if (err) {
                console.error(err);
                console.dir(res.body);
                return;
            }
            InvitationListActionCreators.receiveInvitationLists(res.body);
        });
    },

    receiveInvitationLists: function (invitationLists) {
        Dispatcher.dispatch({
            type: ActionTypes.RECEIVE_INVITATION_LISTS,
            invitationLists: invitationLists
        });
    },

    fetchInvitationList: function (id) {
        request
        .get('/invitationLists/' + id + '/')
        .auth(LoginStore.getEmail(), LoginStore.getPassword())
        .end(function (err, res) {
            if (err) {
                console.error(err);
                console.dir(res.body);
                return;
            }
            InvitationListActionCreators.receiveInvitationList(id, res.body);
        });
    },

    receiveInvitationList: function (id, users) {
        Dispatcher.dispatch({
            type: ActionTypes.RECEIVE_INVITATION_LIST,
            list_id: id,
            users: users
        });
    },

    addInvitationList: function (subject) {
        request
        .post('/invitationLists/')
        .auth(LoginStore.getEmail(), LoginStore.getPassword())
        .send({ subject: subject })
        .end(function (err, res) {
            if (err) {
                console.error(err);
                console.dir(res.body);
                return;
            }
            InvitationListActionCreators.fetchInvitationLists(LoginStore.getEmail(), LoginStore.getPassword());
        });
    },

    addUserToList: function (list_id, user_id) {
        request
        .post('/invitationLists/'+list_id+'/')
        .auth(LoginStore.getEmail(), LoginStore.getPassword())
        .send({ user_id: user_id })
        .end(function (err, res) {
            if (err) {
                console.error(err);
                console.dir(res.body);
                return;
            }
            InvitationListActionCreators.fetchInvitationList(list_id);
        });
    },

    removeUserFromList: function (list_id, user_id) {
        request
        .del('/invitationLists/'+list_id+'/'+user_id+'/')
        .auth(LoginStore.getEmail(), LoginStore.getPassword())
        .end(function (err, res) {
            if (err) {
                console.error(err);
                console.dir(res.body);
                return;
            }
            InvitationListActionCreators.fetchInvitationList(list_id);
        });
    }
};

module.exports = InvitationListActionCreators;
