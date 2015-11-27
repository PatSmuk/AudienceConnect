var React = require('react');

var ChatRoomStore = require('../stores/ChatRoomStore');
var LoginStore = require('../stores/LoginStore');

var ChatRoomActionCreators = require('../actions/ChatRoomActionCreators');


function getStateFromStores(room_id) {
    return {
        room: ChatRoomStore.getChatRoom(room_id)
    };
}

var ChatRoom = React.createClass({

    propTypes: {
        room: React.PropTypes.string.isRequired
    },

    getInitialState: function () {
        return Object.assign({}, getStateFromStores(this.props.room), {
            message: ''
        });
    },

    _onChange: function () {
        this.setState(getStateFromStores(this.props.room));
    },

    componentDidMount: function () {
        ChatRoomStore.addChangeListener(this._onChange);

        var room_id = this.props.room;
        var updateInterval = setInterval(function () {
            ChatRoomActionCreators.fetchMessages(room_id);
        }, 1000);

        this.setState({ updateInterval: updateInterval });
    },

    componentWillUnmount: function () {
        ChatRoomStore.removeChangeListener(this._onChange);
        clearInterval(this.state.updateInterval);
    },

    handleChangeMessage: function (event) {
        this.setState({ message: event.target.value });
    },

    handleClickSend: function (event) {
        if (this.state.message === '')
            return;

        ChatRoomActionCreators.sendMessage(this.props.room, this.state.message);
        this.setState({ message: '' });
    },

    render: function () {
        var messages = this.state.room.messages;

        return (
            <section className="chat-section">
                <div className="messages">
                    {messages ? messages.map(message => {
                        if (message.sender == LoginStore.getUser().id) {
                            return (
                                <div key={message.id} className="sent">
                                    <div className="text">{message.message_text}</div>
                                    <div className="right-triangle"></div>
                                </div>
                            );
                        }
                        else {
                            return (
                                <div key={message.id} className="received">
                                    <img src="http://placehold.it/50x50" width="50px" height="50px" alt="Avatar" />
                                    <div className="left-triangle"></div>
                                    <div className="text">{message.message_text}</div>
                                </div>
                            );
                        }
                    }) : null}
                </div>
                <div className="inputs">
                    <input type="text" value={this.state.message} onChange={this.handleChangeMessage} />
                    <button onClick={this.handleClickSend} >Send</button>
                </div>
            </section>
        );
    }
});

module.exports = ChatRoom;
