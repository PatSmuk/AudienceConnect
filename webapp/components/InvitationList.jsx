var React = require('react');

function getStateFromStores() {
    return {
    }
}

var InvitationList = React.createClass({

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
            <div className="invitation-list">
                <div className="list-container">
                    <ul>Database Project Presentation
                        <li>
                            <img src="http://placehold.it/50x50" width="50px" height="50px" alt="Bob's Avatar" />
                            <span className="name">Albert Fung</span>
                            <a href="#" className="fa fa-times fa-lg"></a>
                        </li>
                        <li>
                            <img src="http://placehold.it/50x50" width="50px" height="50px" alt="Steve's Avatar" />
                            <span className="name">Stuart Calverly</span>
                            <a href="#" className="fa fa-times fa-lg"></a>
                        </li>
                        <li>
                            <img src="http://placehold.it/50x50" width="50px" height="50px" alt="Steve's Avatar" />
                            <span className="name">Jason Runzer</span>
                            <a href="#" className="fa fa-times fa-lg"></a>
                        </li>
                    </ul>
                </div>
                <div className="add-user">
                    <h1>Add User</h1>
                    <label>Name:
                        <div className="line">
                            <input type="text" />
                        </div>
                    </label>
                    <button>Submit</button>
                </div>
            </div>
        );
    }
});

module.exports = InvitationList;
