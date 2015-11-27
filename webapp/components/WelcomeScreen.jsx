var React = require('react');

var LoginStore = require('../stores/LoginStore');
var LoginActionCreators = require('../actions/LoginActionCreators');

function getStateFromStores() {
    return {
        loggingIn: LoginStore.isLoggingIn(),
        error: LoginStore.getError()
    };
}

var WelcomeScreen = React.createClass({

    getInitialState: function () {
        return Object.assign({}, getStateFromStores(), {
            email: '',
            password: ''
        });
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

    handleEmailChange: function (event) {
        this.setState({ email: event.target.value });
    },

    handlePasswordChange: function (event) {
        this.setState({ password: event.target.value });
    },

    handleClickLogin: function (event) {
        LoginActionCreators.login(this.state.email, this.state.password);
    },

    render: function () {
        var errorMessage;
        if (this.state.error) {
            errorMessage = <div className="message-box error">{this.state.error}</div>;
        }

        return (
            <div className="welcome-screen">
                <main>
                    <h2>Welcome to</h2>
                    <h1>Audience Connect</h1>
                    <h3>Please Sign In or Register</h3>

                    {this.state.loggingIn ? (
                        <div className="login-form">
                            <div className="loading">
                                <img src="/img/ring.svg" alt="Loading" />
                            </div>
                        </div>
                    ):(
                        <div className="login-form">
                            {errorMessage}
                            <div className="line">
                                <label>Email:
                                    <input type="email" value={this.state.email} onChange={this.handleEmailChange} />
                                </label>
                            </div>
                            <div className="line">
                                <label>Password:
                                    <input type="password" value={this.state.password} onChange={this.handlePasswordChange} />
                                </label>
                            </div>
                            <div className="line">
                                <div className="buttons">
                                    <button>Register</button>
                                    <button onClick={this.handleClickLogin}>Sign In</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        );
    }
});

module.exports = WelcomeScreen;
