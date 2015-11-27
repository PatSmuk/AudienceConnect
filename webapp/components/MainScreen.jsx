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

    handleClickInvitationLists: function () {
        if (!this.state.user.presenter) {
            console.error('Tried to edit invitation lists as non-presenter.');
            return;
        }
        this.setState({
            editingInvitationLists: true,
            selectedChatRoom: null
        });
    },

    handleClickChatRoom: function (room_id) {
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
                            <a href="#" onClick={this.handleClickChatRoom.bind(this, 1)} className={this.state.selectedChatRoom == 1 ? "active" : ""}>
                                <span className="fa fa-chevron-right"></span>
                                Bob's Room
                            </a>
                            <a href="#" onClick={this.handleClickChatRoom.bind(this, 2)} className={this.state.selectedChatRoom == 2 ? "active" : ""}>
                                <span className="fa fa-chevron-right"></span>
                                Steve's Room
                            </a>
                            <a href="#" onClick={this.handleClickChatRoom.bind(this, 3)} className={this.state.selectedChatRoom == 3 ? "active" : ""}>
                                <span className="fa fa-chevron-right"></span>
                                Brian's Room
                            </a>
                        </div>

                        {this.state.user.presenter ? <ChatRoomBuilder /> : null}
                    </section>

                    {this.state.editingInvitationLists ? <InvitationLists /> : null}
                    {this.state.editingInvitationLists ? <InvitationListBuilder /> : null}

                    {this.state.selectedChatRoom ? <ChatRoom room={selectedChatRoom} /> : null}
                    {this.state.selectedChatRoom ? <Polls room={selectedChatRoom} /> : null}
                </main>
            </div>
        );
    }
});

module.exports = MainScreen;
