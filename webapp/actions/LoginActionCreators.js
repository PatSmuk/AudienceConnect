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
            LoginActionCreators.receiveLoginResponse(err, email, password, err ? null : res.body);
        });
    },

    receiveLoginResponse: function (error, email, password, user) {
        Dispatcher.dispatch({
            type: ActionTypes.RECEIVE_LOGIN_RESPONSE,
            error: error,
            email: email,
            password: password,
            user: user
        })
    }
};

module.exports = LoginActionCreators;
