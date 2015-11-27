var React = require('react');

var InvitationList = require('./InvitationList.jsx');
var InvitationListStore = require('../stores/InvitationListStore');

function getStateFromStores() {
    return {
        invitationLists: InvitationListStore.getAll()
    }
}

var InvitationLists = React.createClass({

    getInitialState: function () {
        return Object.assign({}, getStateFromStores(), {
        });
    },

    _onChange: function () {
        this.setState(getStateFromStores());
    },

    componentDidMount: function () {
        InvitationListStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        InvitationListStore.removeChangeListener(this._onChange);
    },

    render: function () {
        return (
            <section className="invitation-list-section">
                {this.state.invitationLists.map(function (invitationListID) {
                    return <InvitationList key={invitationListID} id={invitationListID} />;
                })}
            </section>
        );
    }
});

module.exports = InvitationLists;
