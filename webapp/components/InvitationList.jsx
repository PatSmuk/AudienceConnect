var React = require('react');

var InvitationListActionCreators = require('../actions/InvitationListActionCreators');

var InvitationListStore = require('../stores/InvitationListStore');
var UserStore = require('../stores/UserStore');
var LoginStore = require('../stores/LoginStore');

function getStateFromStores(list_id) {
    var list = InvitationListStore.getInvitationList(list_id);
    var users = UserStore.getAll();

    if (users && list.users) {
        users = users.filter(function (user_id) {
            if (user_id == LoginStore.getUser().id)
                return false;

            var found = false;
            list.users.forEach(function (list_member) {
                if (user_id == list_member) {
                    found = true;
                }
            });
            return !found;
        });
    }

    return {
        list: list,
        users: users
    }
}

var InvitationList = React.createClass({

    propTypes: {
        id: React.PropTypes.string.isRequired
    },

    getInitialState: function () {
        return Object.assign({}, getStateFromStores(this.props.id), {
            selectedUser: null
        });
    },

    _onChange: function () {
        this.setState(getStateFromStores(this.props.id));
    },

    componentDidMount: function () {
        InvitationListStore.addChangeListener(this._onChange);
        UserStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        InvitationListStore.removeChangeListener(this._onChange);
        UserStore.removeChangeListener(this._onChange);
    },

    handleSelectUser: function (event) {
        this.setState({ selectedUser: event.target.value });
    },

    handleAddUser: function () {
        var selectedUser = this.state.selectedUser;
        if (!selectedUser) {
            if (!this.state.users)
                return;
            selectedUser = this.state.users[0];
        }
        InvitationListActionCreators.addUserToList(this.props.id, selectedUser);
    },

    handleRemoveUser: function (user_id, event) {
        event.preventDefault();
        InvitationListActionCreators.removeUserFromList(this.props.id, user_id);
    },

    render: function () {
        return (
            <div className="invitation-list">
                <div className="list-container">
                    <ul>
                        {this.state.list.subject}

                        {this.state.list.users ? this.state.list.users.map((user_id) => {
                            var user = UserStore.getUser(user_id);
                            return (
                                <li key={user_id}>
                                    <img src="http://placehold.it/50x50" width="50px" height="50px" alt="Bob's Avatar" />
                                    <span className="name">{user ? user.fullName : 'Loading...'}</span>
                                    <a href="#" className="fa fa-times fa-lg" onClick={this.handleRemoveUser.bind(this, user_id)}></a>
                                </li>
                            );
                        }) : null}
                    </ul>
                </div>
                <div className="add-user">
                    <h1>Add User</h1>
                    <label>
                        Name:
                        <div className="line">
                            <select onChange={this.handleSelectUser}>
                                {this.state.users ? this.state.users.map((user_id) => {
                                    var user = UserStore.getUser(user_id);
                                    return <option value={user_id} key={user_id}>{user ? user.fullName : 'Loading...'}</option>
                                }) : null}
                            </select>
                        </div>
                    </label>
                    <button onClick={this.handleAddUser}>Submit</button>
                </div>
            </div>
        );
    }
});

module.exports = InvitationList;
