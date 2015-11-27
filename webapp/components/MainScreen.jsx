var React = require('react');

var MainScreen = React.createClass({

    render: function () {
        return (
            <div className="main-screen">
                <header>
                    <a href="#">Audience Connect</a>
                </header>
                <main>
                    <section className="room-section">
                        <a href="#" className="active">
                            <span className="fa fa-lg fa-list"></span>
                            Invitation Lists
                        </a>
                        <div className="room-list">
                            <h1>Chat Rooms</h1>
                            <a href="#">
                                <span className="fa fa-chevron-right"></span>
                                Bob's Room
                            </a>
                            <a href="#">
                                <span className="fa fa-chevron-right"></span>
                                Steve's Room
                            </a>
                            <a href="#">
                                <span className="fa fa-chevron-right"></span>
                                Brian's Room
                            </a>
                        </div>
                        <div className="room-builder">
                            <h1>Add Chat Room</h1>
                            <label>Room Name:
                                <div className="line">
                                    <input type="text" />
                                </div>
                            </label>
                            <label>Invitation List:
                                <div className="line">
                                    <select>
                                        <option value="1">Database Project Presentation</option>
                                    </select>
                                </div>
                            </label>
                            <button>Submit</button>
                        </div>
                    </section>
                    <section style={{display: 'none'}} className="invitation-list-section">
                        <div className="invitation-list">
                            <div className="list-container">
                                <ul>Database Project Presentation
                                    <li>
                                        <img src="http://placehold.it/50x50" width="50px" height="50px" alt="Bob's Avatar" />
                                        <span className="name">Albert Fung</span>
                                        <a href="#" className="fa fa-times fa-lg"></a>
                                    </li>
                                    <li>
                                        <img src="http://placehold.it/50x50" width="50px" height="50px" alt="Steve's Avatar" />
                                        <span className="name">Stuart Calverly</span>
                                        <a href="#" className="fa fa-times fa-lg"></a>
                                    </li>
                                    <li>
                                        <img src="http://placehold.it/50x50" width="50px" height="50px" alt="Steve's Avatar" />
                                        <span className="name">Jason Runzer</span>
                                        <a href="#" className="fa fa-times fa-lg"></a>
                                    </li>
                                </ul>
                            </div>
                            <div className="add-user">
                                <h1>Add User</h1>
                                <label>Name:
                                    <div className="line">
                                        <input type="text" />
                                    </div>
                                </label>
                                <button>Submit</button>
                            </div>
                        </div>
                    </section>
                    <section style={{display: 'none'}} className="add-invitation-list">
                        <h1>Add Invitation List</h1>
                        <label>List Name:
                            <div className="line">
                                <input type="text" />
                            </div>
                        </label>
                        <button>Submit</button>
                    </section>
                    <section className="chat-section">
                        <div className="messages">
                            <div className="received">
                                <img src="http://placehold.it/50x50" width="50px" height="50px" alt="Avatar" />
                                <div className="left-triangle"></div>
                                <div className="text"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse bibendum lacus orci, et blandit lacus gravida id. Vestibulum sit amet mauris lacus. Nullam congue gravida metus, in bibendum libero interdum at. Mauris rhoncus sed nisi a fermentum. Nulla facilisi. Nullam pellentesque vel elit nec dictum. Duis in rhoncus metus. Sed blandit consectetur odio, nec laoreet elit placerat id.</div>
                                </div>
                                <div className="sent">
                                <div className="text">Wut</div>
                                <div className="right-triangle"></div>
                            </div>
                        </div>
                        <div className="inputs">
                            <input type="text" />
                            <button>Send</button>
                        </div>
                    </section>
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
                    </section>
                </main>
            </div>
        );
    }
});

module.exports = MainScreen;
