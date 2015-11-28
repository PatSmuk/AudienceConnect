var React = require('react');

var PollBuilder = require('./PollBuilder.jsx');

var ChatRoomStore = require('../stores/ChatRoomStore');
var LoginStore = require('../stores/LoginStore');

var ChatRoomActionCreators = require('../actions/ChatRoomActionCreators');


function getStateFromStores(room_id) {
    return {
        polls: ChatRoomStore.getChatRoom(room_id).polls
    };
}

var Polls = React.createClass({

    propTypes: {
        room: React.PropTypes.string.isRequired
    },

    getInitialState: function () {
        return Object.assign({}, getStateFromStores(this.props.room), {
        });
    },

    _onChange: function () {
        this.setState(getStateFromStores(this.props.room));
    },

    componentDidMount: function () {
        ChatRoomStore.addChangeListener(this._onChange);

        var room_id = this.props.room;
        var updateInterval = setInterval(function () {
            ChatRoomActionCreators.fetchPolls(room_id);
        }, 1000);

        this.setState({ updateInterval: updateInterval });
    },

    componentWillUnmount: function () {
        ChatRoomStore.removeChangeListener(this._onChange);
        clearInterval(this.state.updateInterval);
    },

    handleVote: function (poll_id, answer_id) {
        ChatRoomActionCreators.vote(this.props.room, poll_id, answer_id);
    },

    render: function () {
        return (
            <section className="poll-section">
                <div className="polls">
                    <h1>Polls</h1>

                    {this.state.polls.map(poll => (
                        <div key={poll.id} className="poll">
                            <div className="question">{poll.question}</div>
                            <ol className="answers">
                                {poll.answers.map(answer => (
                                    <li key={answer.id}>
                                        <a href="#" onClick={this.handleVote.bind(this, poll.id, answer.id)}>{answer.answer}</a>
                                        <span className="votes"> — {answer.votes} votes</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>

                {LoginStore.getUser().presenter ? <PollBuilder room={this.props.room} /> : null}
            </section>
        );
    }
});

module.exports = Polls;
