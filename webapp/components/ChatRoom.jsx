var React = require('react');

function getStateFromStores() {
    return {
    }
}

var ChatRoom = React.createClass({

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
            <section className="chat-section">
                <div className="messages">
                    <div className="received">
                        <img src="http://placehold.it/50x50" width="50px" height="50px" alt="Avatar" />
                        <div className="left-triangle"></div>
                        <div className="text"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse bibendum lacus orci, et blandit lacus gravida id. Vestibulum sit amet mauris lacus. Nullam congue gravida metus, in bibendum libero interdum at. Mauris rhoncus sed nisi a fermentum. Nulla facilisi. Nullam pellentesque vel elit nec dictum. Duis in rhoncus metus. Sed blandit consectetur odio, nec laoreet elit placerat id.</div>
                    </div>
                    <div className="sent">
                        <div className="text">Wut</div>
                        <div className="right-triangle"></div>
                    </div>
                </div>
                <div className="inputs">
                    <input type="text" />
                    <button>Send</button>
                </div>
            </section>
        );
    }
});

module.exports = ChatRoom;
