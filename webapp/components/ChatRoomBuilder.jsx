var React = require('react');

var InvitationListStore = require('../stores/InvitationListStore');
var ChatRoomActionCreators = require('../actions/ChatRoomActionCreators');

function getStateFromStores() {
    var invitationLists = InvitationListStore.getAll().map(function (list_id) {
        return {
            id: list_id,
            subject: InvitationListStore.getInvitationList(list_id).subject
        }
    });

    return {
        invitationLists: invitationLists
    };
}

var ChatRoomBuilder = React.createClass({

    getInitialState: function () {
        return Object.assign({}, getStateFromStores(), {
            selectedList: null,
            roomName: ''
        });
    },

    _onChange: function () {
        this.setState(getStateFromStores());
    },

    componentDidMount: function () {
        InvitationListStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        InvitationListStore.removeChangeListener(this._onChange);
    },

    handleSelectInvitationList: function (event) {
        this.setState({ selectedList: event.target.value });
    },

    handleChangeRoomName: function (event) {
        this.setState({ roomName: event.target.value });
    },

    handleClickAdd: function (event) {
        event.preventDefault();

        if (this.state.roomName === '') {
            return;
        }

        var invitationList = this.state.selectedList;
        if (!invitationList) {
            if (this.state.invitationLists.length > 0) {
                invitationList = this.state.invitationLists[0].id;
            }
            else {
                return;
            }
        }

        ChatRoomActionCreators.addChatRoom(this.state.roomName, invitationList);
        this.setState({ roomName: '' });
    },

    render: function () {
        var invitationLists = this.state.invitationLists;
        return (
            <div className="room-builder">
                <h1>Add Chat Room</h1>
                <label>
                    Room Name:
                    <div className="line">
                        <input type="text" value={this.state.roomName} onChange={this.handleChangeRoomName} />
                    </div>
                </label>
                <label>
                    Invitation List:
                    <div className="line">
                        <select onChange={this.handleSelectInvitationList}>
                            {invitationLists.map((list) => <option key={list.id} value={list.id} >{list.subject}</option>)}
                        </select>
                    </div>
                </label>
                <button onClick={this.handleClickAdd}>Submit</button>
            </div>
        );
    }
});

module.exports = ChatRoomBuilder;
