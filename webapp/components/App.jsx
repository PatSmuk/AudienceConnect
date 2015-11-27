var React = require('react');

var WelcomeScreen   = require('./WelcomeScreen.jsx');
var MainScreen      = require('./MainScreen.jsx');

var LoginStore = require('../stores/LoginStore');


function getStateFromStores() {
    return {
        loggedIn: LoginStore.isLoggedIn()
    }
}

var App = React.createClass({

    getInitialState: function () {
        return getStateFromStores();
    },

    _onChange: function () {
        this.setState(getStateFromStores());
    },

    componentDidMount: function () {
        LoginStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        LoginStore.removeChangeListener(this._onChange);
    },

    render: function () {
        if (!this.state.loggedIn) {
            return <WelcomeScreen />;
        }
        else {
            return <MainScreen />;
        }
    }
});

module.exports = App;
