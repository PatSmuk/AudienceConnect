var React = require('react');

var LoginStore = require('../stores/LoginStore');
var ChatRoomStore = require('../stores/ChatRoomStore');

var ChatRoom                = require('./ChatRoom.jsx');
var ChatRoomBuilder         = require('./ChatRoomBuilder.jsx');
var InvitationLists         = require('./InvitationLists.jsx');
var InvitationListBuilder   = require('./InvitationListBuilder.jsx');
var Polls                   = require('./Polls.jsx');

function getStateFromStores() {
    return {
        user: LoginStore.getUser(),
        chatRooms: ChatRoomStore.getChatRooms()
    }
}

var MainScreen = React.createClass({

    getInitialState: function () {
        return Object.assign({}, getStateFromStores(), {
            editingInvitationLists: false,
            selectedChatRoom: null
        });
    },

    _onChange: function () {
        this.setState(getStateFromStores());
    },

    componentDidMount: function () {
        ChatRoomStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        ChatRoomStore.removeChangeListener(this._onChange);
    },

    handleClickInvitationLists: function (event) {
        event.preventDefault();

        if (!this.state.user.presenter) {
            console.error('Tried to edit invitation lists as non-presenter.');
            return;
        }
        this.setState({
            editingInvitationLists: true,
            selectedChatRoom: null
        });
    },

    handleClickChatRoom: function (room_id, event) {
        event.preventDefault();
        
        this.setState({
            editingInvitationLists: false,
            selectedChatRoom: room_id
        });
    },

    render: function () {
        return (
            <div className="main-screen">
                <header>
                    <a href="#">Audience Connect</a>
                </header>
                <main>
                    <section className="room-section">
                        {this.state.user.presenter ? (
                            <a href="#" onClick={this.handleClickInvitationLists} className={this.state.editingInvitationLists ? "active" : ""}>
                                <span className="fa fa-lg fa-list"></span>
                                Invitation Lists
                            </a>
                        ) : null}

                        <div className="room-list">
                            <h1>Chat Rooms</h1>
                            {this.state.chatRooms.map((chatRoom) => {
                                return (
                                    <a key={chatRoom.id} href="#" onClick={this.handleClickChatRoom.bind(this, chatRoom.id)} className={this.state.selectedChatRoom == chatRoom.id ? "active" : ""}>
                                        <span className="fa fa-chevron-right"></span>
                                        {chatRoom.room_name}
                                    </a>
                                );
                            })}
                        </div>

                        {this.state.user.presenter ? <ChatRoomBuilder /> : null}
                    </section>

                    {this.state.editingInvitationLists ? <InvitationLists /> : null}
                    {this.state.editingInvitationLists ? <InvitationListBuilder /> : null}

                    {this.state.selectedChatRoom ? <ChatRoom room={this.state.selectedChatRoom} /> : null}
                    {this.state.selectedChatRoom ? <Polls room={this.state.selectedChatRoom} /> : null}
                </main>
            </div>
        );
    }
});

module.exports = MainScreen;
