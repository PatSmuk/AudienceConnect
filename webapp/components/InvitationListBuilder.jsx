var React = require('react');

function getStateFromStores() {
    return {
    }
}

var InvitationListBuilder = React.createClass({

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
            <section className="add-invitation-list">
                <h1>Add Invitation List</h1>
                <label>List Name:
                    <div className="line">
                        <input type="text" />
                    </div>
                </label>
                <button>Submit</button>
            </section>
        );
    }
});

module.exports = InvitationListBuilder;
