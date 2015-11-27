var React = require('react');

var InvitationList = require('./InvitationList.jsx');

function getStateFromStores() {
    return {
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
    },

    componentWillUnmount: function () {
    },

    render: function () {
        return (
            <section className="invitation-list-section">
                <InvitationList />
            </section>
        );
    }
});

module.exports = InvitationLists;
