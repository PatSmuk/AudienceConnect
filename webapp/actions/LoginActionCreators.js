var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;
var ChatRoomActionCreators = require('./ChatRoomActionCreators');
var InvitationListActionCreators = require('./InvitationListActionCreators');

var request = require('superagent');

var LoginActionCreators = {

    register: function (email, password) {
        request
        .post('/register')
        .send({ email: email, password: password })
        .end(function (err, res) {
            if (err) {
                console.dir(res);
                return LoginActionCreators.receiveRegistrationError(err);
            }
            LoginActionCreators.receiveRegistrationSuccess();
        });
    },
    
    receiveRegistrationSuccess: function () {
        Dispatcher.dispatch({
            type: ActionTypes.RECEIVE_REGISTRATION_SUCCESS
        });
    },
    
    receiveRegistrationError: function (error) {
        Dispatcher.dispatch({
            type: ActionTypes.RECEIVE_REGISTRATION_ERROR,
            error: error
        });
    },

    login: function (email, password) {
        request
        .get('/users/me')
        .auth(email, password)
        .end(function (err, res) {
            if (err) {
                console.dir(res);
                return LoginActionCreators.receiveLoginError(err);
            }
            LoginActionCreators.receiveLoginSuccess(email, password, res.body);
        });
    },

    receiveLoginSuccess: function (email, password, user) {
        Dispatcher.dispatch({
            type: ActionTypes.RECEIVE_LOGIN_SUCCESS,
            email: email,
            password: password,
            user: user
        });

        ChatRoomActionCreators.fetchChatRooms(email, password);
        if (user.presenter) {
            InvitationListActionCreators.fetchInvitationLists(email, password);
        }
    },

    receiveLoginError: function (error) {
        Dispatcher.dispatch({
            type: ActionTypes.RECEIVE_LOGIN_ERROR,
            error: error
        });
    }
};

module.exports = LoginActionCreators;
