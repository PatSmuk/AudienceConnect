var React = require('react');

var ChatRoomActionCreators = require('../actions/ChatRoomActionCreators');


var PollBuilder = React.createClass({

    propTypes: {
        room: React.PropTypes.string.isRequired
    },

    getInitialState: function () {
        return {
            question: '',
            answers: ['']
        };
    },

    handleAddAnswer: function () {
        this.state.answers.push('');
        this.setState({ answers: this.state.answers });
    },

    handleRemoveAnswer: function (index) {
        this.state.answers.splice(index, 1);
        this.setState({ answers: this.state.answers });
    },

    handleUpdateAnswer: function (index, event) {
        this.state.answers[index] = event.target.value;
        this.setState({ answers: this.state.answers });
    },

    handleUpdateQuestion: function (event) {
        this.setState({ question: event.target.value });
    },

    handleSubmitPoll: function () {
        if (this.state.question === '' || this.state.answers[0] === '')
            return;

        ChatRoomActionCreators.addPoll(this.props.room, this.state.question, this.state.answers);
    },

    render: function () {
        return (
            <div className="poll-builder">
                <h1>Add Poll</h1>
                <label>
                    Question:
                    <div className="line">
                        <input type="text" value={this.state.question} onChange={this.handleUpdateQuestion} />
                    </div>
                </label>
                <label>
                    Answers:
                    {this.state.answers.map((answer, index) => (
                        <div key={index} className="line">
                            <span className="label">{index+1}.</span>
                            <input type="text" value={this.state.answers[index]} onChange={this.handleUpdateAnswer.bind(this, index)} />
                            {index > 0 ? (
                                <a href="#" className="fa fa-times fa-lg" onClick={this.handleRemoveAnswer.bind(this, index)}></a>
                            ) : null}
                        </div>
                    ))}
                </label>
                <div className="buttons">
                    <button onClick={this.handleAddAnswer}>Add Answer</button>
                    <button onClick={this.handleSubmitPoll}>Submit</button>
                </div>
            </div>
        );
    }
});

module.exports = PollBuilder;
