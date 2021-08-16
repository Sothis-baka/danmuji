import React from "react";
// local storage works in dev but not in build
// const ls = window.localStorage;

class Entrance extends React.Component {
    constructor(props) {
        super(props);

        // init state
        this.state = { roomId: "", expand: false };
    }

    componentDidMount() {
        // if has history in local storage, use it
        this.setState({
            roomId: /*JSON.parse(ls.getItem('history')).history || */""
        });
    }

    /* use to handle roomId input area */
    handleChange = (e) => {
        this.setState({ roomId: e.target.value });
    }

    /* use to handle submit event of the form */
    handleSubmit = async (e) => {
        e.preventDefault();

        const roomId = this.state.roomId.trim();

        //ls.setItem('history', JSON.stringify({ history: roomId }));
        this.props.setRoomId(roomId);
    }

    render() {
        return (
            <form id='entrance' onSubmit={this.handleSubmit}>
                <p>蛋 母 鸡</p>
                <input type='text' value={ this.state.roomId } placeholder='Enter room id' onChange={this.handleChange} autoFocus={true}/>
                <input type='submit' value='Connect'/>
            </form>
        );
    }
}

export default Entrance;