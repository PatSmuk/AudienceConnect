var React = require('react');

var PollBuilder = require('./PollBuilder.jsx');

function getStateFromStores() {
    return {
    }
}

var Polls = React.createClass({

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
            <section className="poll-section">
                <div className="polls">
                    <h1>Polls</h1>
                    <div className="poll">
                        <div className="question">Do you want to RP?</div>
                        <ol className="answers">
                            <li><a href="#" className="selected">Yes</a><span className="votes"> — 10 votes</span></li>
                            <li><a href="#">No</a><span className="votes"> — 20 votes</span></li>
                        </ol>
                    </div>
                    <div className="poll">
                        <div className="question">Do you wish to continue?</div>
                        <ol className="answers">
                            <li><a href="#">Yes</a></li>
                            <li><a href="#" className="selected">No</a></li>
                        </ol>
                    </div>
                </div>
                <PollBuilder />
            </section>
        );
    }
});

module.exports = Polls;
