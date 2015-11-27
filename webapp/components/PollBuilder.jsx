var React = require('react');

function getStateFromStores() {
    return {
    }
}

var PollBuilder = React.createClass({

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
            <div className="poll-builder">
                <h1>Add Poll</h1>
                <label>
                    Question:
                    <div className="line">
                        <input type="text" />
                    </div>
                </label>
                <label>
                    Answers:
                    <div className="line"><span className="label">1.</span>
                        <input type="text" />
                        <a href="#" className="fa fa-times fa-lg"></a>
                    </div>
                    <div className="line"><span className="label">2.</span>
                        <input type="text" />
                        <a href="#" className="fa fa-times fa-lg"></a>
                    </div>
                    <div className="line"><span className="label">3.</span>
                        <input type="text" />
                        <a href="#" className="fa fa-times fa-lg"></a>
                    </div>
                </label>
                <div className="buttons">
                    <button>Add Answer</button>
                    <button>Submit</button>
                </div>
            </div>
        );
    }
});

module.exports = PollBuilder;
