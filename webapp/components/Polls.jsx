var React = require('react');

var PollBuilder = require('./PollBuilder.jsx');

var ChatRoomStore = require('../stores/ChatRoomStore');


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
    },

    componentWillUnmount: function () {
        ChatRoomStore.removeChangeListener(this._onChange);
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
                                        <a href="#" className="selected">{answer.answer}</a>
                                        <span className="votes"> — {answer.votes} votes</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>
                <PollBuilder room={this.props.room} />
            </section>
        );
    }
});

module.exports = Polls;
