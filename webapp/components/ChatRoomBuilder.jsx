var React = require('react');

function getStateFromStores() {
    return {
    }
}

var ChatRoomBuilder = React.createClass({

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
            <div className="room-builder">
                <h1>Add Chat Room</h1>
                <label>
                    Room Name:
                    <div className="line">
                        <input type="text" />
                    </div>
                </label>
                <label>
                    Invitation List:
                    <div className="line">
                        <select>
                            <option value="1">Database Project Presentation</option>
                        </select>
                    </div>
                </label>
                <button>Submit</button>
            </div>
        );
    }
});

module.exports = ChatRoomBuilder;
