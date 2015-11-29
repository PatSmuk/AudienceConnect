var React = require('react');

var ChatRoomStore = require('../stores/ChatRoomStore');
var LoginStore = require('../stores/LoginStore');
var UserStore = require('../stores/UserStore');

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

        var updateInterval = setInterval(() => {
            ChatRoomActionCreators.fetchMessages(this.props.room);
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

    handleClickSend: function () {
        if (this.state.message === '')
            return;

        ChatRoomActionCreators.sendMessage(this.props.room, this.state.message);
        this.setState({ message: '' });
    },

    handleInputKeyPress: function (event) {
        if (event.which == 13)
            this.handleClickSend();
    },

    render: function () {
        var messages = this.state.room.messages;

        return (
            <section className="chat-section">
                <div className="messages">
                    {messages ? messages.map(message => {
                        var sender = UserStore.getUser(message.sender);

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
                                    <img src={(sender && sender.avatar) ? sender.avatar : "http://placehold.it/50x50"} width="50px" height="50px" alt="Avatar" />
                                    <div className="left-triangle"></div>
                                    <div className="text">{message.message_text}</div>
                                </div>
                            );
                        }
                    }) : null}
                </div>
                <div className="inputs">
                    <input type="text" value={this.state.message} onChange={this.handleChangeMessage} onKeyPress={this.handleInputKeyPress} />
                    <button onClick={this.handleClickSend} >Send</button>
                </div>
            </section>
        );
    }
});

module.exports = ChatRoom;
