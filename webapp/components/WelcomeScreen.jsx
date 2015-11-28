var React = require('react');

var LoginStore = require('../stores/LoginStore');
var LoginActionCreators = require('../actions/LoginActionCreators');

function getStateFromStores() {
    return {
        error: LoginStore.getError(),
        registrationSuccessful: LoginStore.isRegistrationSuccessful()
    };
}

var WelcomeScreen = React.createClass({

    getInitialState: function () {
        return Object.assign({}, getStateFromStores(), {
            email: '',
            password: '',
            loading: false
        });
    },

    _onChange: function () {
        var newState = getStateFromStores();
        if (this.state.loading && (newState.error || newState.registrationSuccessful)) {
            newState.loading = false;
        }
        this.setState(newState);
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

    handleLogin: function () {
        if (this.state.email === '' || this.state.password === '')
            return;

        LoginActionCreators.login(this.state.email, this.state.password);
        this.setState({ loading: true });
    },

    handleInputKeyPress: function (event) {
        if (event.which == 13)
            this.handleLogin();
    },

    handleRegister: function () {
        if (this.state.email === '' || this.state.password === '')
            return;

        LoginActionCreators.register(this.state.email, this.state.password);
        this.setState({ loading: true });
    },

    render: function () {
        var feedback;
        if (this.state.error) {
            feedback = <div className="message-box error">{this.state.error}</div>;
        }
        else if (this.state.registrationSuccessful) {
            feedback = <div className="message-box success">Registration successful.</div>;
        }

        return (
            <div className="welcome-screen">
                <main>
                    <h2>Welcome to</h2>
                    <h1>Audience Connect</h1>
                    <h3>Please Sign In or Register</h3>

                    {this.state.loading ? (
                        <div className="login-form">
                            <div className="loading">
                                <img src="/img/ring.svg" alt="Loading" />
                            </div>
                        </div>
                    ):(
                        <div className="login-form">
                            {feedback}
                            <div className="line">
                                <label>Email:
                                    <input type="email" onKeyPress={this.handleInputKeyPress} value={this.state.email} onChange={this.handleEmailChange} />
                                </label>
                            </div>
                            <div className="line">
                                <label>Password:
                                    <input type="password" onKeyPress={this.handleInputKeyPress} value={this.state.password} onChange={this.handlePasswordChange} />
                                </label>
                            </div>
                            <div className="line">
                                <div className="buttons">
                                    <button onClick={this.handleRegister}>Register</button>
                                    <button onClick={this.handleLogin}>Sign In</button>
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
