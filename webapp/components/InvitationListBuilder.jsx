var React = require('react');

var InvitationListActionCreators = require('../actions/InvitationListActionCreators');

function getStateFromStores() {
    return {
    }
}

var InvitationListBuilder = React.createClass({

    getInitialState: function () {
        return Object.assign({}, getStateFromStores(), {
            subject: ''
        });
    },

    _onChange: function () {
        this.setState(getStateFromStores());
    },

    componentDidMount: function () {
    },

    componentWillUnmount: function () {
    },

    handleSubjectChange: function (event) {
        this.setState({ subject: event.target.value });
    },

    handleClickAdd: function () {
        InvitationListActionCreators.addInvitationList(this.state.subject);
        this.setState({ subject: '' });
    },

    render: function () {
        return (
            <section className="add-invitation-list">
                <h1>Add Invitation List</h1>
                <label>List Subject:
                    <div className="line">
                        <input type="text" value={this.state.subject} onChange={this.handleSubjectChange} />
                    </div>
                </label>
                <button onClick={this.handleClickAdd}>Submit</button>
            </section>
        );
    }
});

module.exports = InvitationListBuilder;
