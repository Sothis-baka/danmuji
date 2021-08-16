import React from "react";

import './App.css';
import Entrance from "./component/Entrance";
import MainContent from "./component/MainContent";

class App extends React.Component{
    constructor(props) {
        super(props);

        this.state = { roomId: -1 };
    }

    setRoomId = (input) => {
        this.setState({ roomId: input })
    }

    render() {
        const roomId = this.state.roomId;

        return (
            <div className="App">
                <div id="wrapper">
                    {roomId < 0 ? <Entrance setRoomId={ this.setRoomId }/> : <MainContent roomId={ roomId } setRoomId={ this.setRoomId }/>}
                </div>
            </div>
        );
    }
}

export default App;
