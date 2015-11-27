var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;

var request = require('superagent');

var LoginActionCreators = {

    login: function (email, password) {
        Dispatcher.dispatch({
            type: ActionTypes.LOGIN,
            email: email,
            password: password
        });

        request
        .get('/users/me')
        .auth(email, password)
        .end(function (err, res) {
            if (err) {
                LoginActionCreators.receiveLoginError(err);
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
        })
    },

    receiveLoginError: function (error) {
        Dispatcher.dispatch({
            type: ActionTypes.RECEIVE_LOGIN_ERROR,
            error: error
        });
    }
};

module.exports = LoginActionCreators;
