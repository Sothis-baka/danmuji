import React from "react";

import MainContent from "./component/MainContent";
import RoomSelector from "./component/RoomSelector";
import './App.css';

class App extends React.Component{
  constructor(props) {
    super(props);

    this.state = { roomId: -1 };
  }

  selectRoom = (input) => {
    this.setState({ roomId: input })
  }

  render() {
    return (
        <div className="App">
          {
            this.state.roomId < 0 ? <RoomSelector selectRoom={ this.selectRoom }/> : <MainContent roomId={ this.state.roomId } selectRoom={ this.selectRoom } />
          }
        </div>
    );
  }
}

export default App;
