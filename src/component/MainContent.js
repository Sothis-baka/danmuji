import React from "react";
const { LiveWS } = require('bilibili-live-ws');

const speechSynthesis = window.speechSynthesis;

class MainContent extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            msgList: [],
            msgShowing: [],
            sound: false,
            log: false
        }

        this.count = 0;
    }

    componentDidMount= () => {
        this.initLive();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const elem = document.getElementById('danmuArea');
        elem.scrollTop = elem.scrollHeight;
    }

    addMsg = (content) => {
        const msgList = this.state.msgList.slice(0);
        msgList.push(content);

        const msgShowing = this.filterMsg(msgList, this.state.log);
        this.setState({ msgList, msgShowing });
    }

    filterMsg = (msgList, log) => {
        const msgShowing = [];

        // only show gift message
        if(log){
            for(let giftMsg of msgList.filter(msg => msg.type === "gift")){
                msgShowing.push(<li key={this.count}><p><small><span className='username'>{ giftMsg.username }</span>赠送了{ giftMsg.num }个<span className='giftName'>{  giftMsg.giftName }</span></small></p></li>);
                this.count++;
            }

            return msgShowing;
        }

        if(msgList.length < 20){
            msgShowing.push(<li key={this.count}><p>已连接到房间</p></li>);
        }

        for(let temp of msgList.filter(msg => msg.type==='danmu').slice(msgList.length - 20, msgList.length)){
            msgShowing.push(<li key={this.count}><p><a href={'https://space.bilibili.com/' + temp.userId} target='_blank' rel='noreferrer'>{temp.username + ': '}</a>{temp.content}</p></li>)
            this.count++;
        }

        let content;

        const greetings = msgList.filter(msg => msg.type === "enter room")
        if(greetings.length > 0){
            content = greetings[greetings.length - 1];
            msgShowing.push(<li key={this.count}><p><small><span className='username'>{ content.username }</span> 进入了直播间</small></p></li>);
            this.count++;
        }

        const gifts = msgList.filter(msg => msg.type === "gift")
        if(gifts.length > 0){
            content = gifts[gifts.length - 1];
            msgShowing.push(<li key={this.count}><p><small><span className='username'>{ content.username }</span> 赠送了 { content.num } 个 <span className='giftName'>{ content.giftName }</span></small></p></li>)
            this.count++;
        }

        return msgShowing
    }

    speak = (str) => {
        const msg = new SpeechSynthesisUtterance(str);
        msg.lang = 'zh';
        speechSynthesis.speak(msg);
    }

    initLive = () => {
        const live = new LiveWS(Number(this.props.roomId));

        live.on('open', () => {
            this.addMsg({
                type: "init",
                content: "Connected to room: " + this.props.roomId
            });

            if(this.state.sound){
                this.speak("Connected to room: " + this.props.roomId);
            }
        });

        live.on('live', () => {
            live.on('heartbeat', () => {});

            live.on('DANMU_MSG', (data) => {
                const username = data.info[2][1];
                const userId = data.info[2][0];
                const content = data.info[1];

                if(this.state.sound){
                    const lastOne = this.state.msgList[this.state.msgList.length - 1]

                    if(lastOne.type === 'danmu' && lastOne.username === username && lastOne.content === content){
                        this.speak(username + "请不要刷屏");
                    }else{
                        this.speak(username + "说 " + content);
                    }
                }

                this.addMsg({
                    type: "danmu",
                    username,
                    userId,
                    content
                })
            })

            live.on('INTERACT_WORD', (data) => {
                const username = data.data['uname']

                if(this.state.sound){
                    const lastOne = this.state.msgList[this.state.msgList.length - 1]
                    this.speak(username + "进入了直播间");
                    if(lastOne.type === 'enter room' && lastOne.username === username)
                        this.speak(username + "请不要反复横跳");
                }

                this.addMsg({
                    type: "enter room",
                    username
                })
            })
            live.on('SEND_GIFT', (data) => {
                const username = data.data['uname'];
                const giftName = data.data['giftName'];
                const num = data.data['num'];

                if(this.state.sound){
                    const lastOne = this.state.msgList[this.state.msgList.length - 1]
                    if(lastOne.type !== 'gift' || (lastOne.username && lastOne.username !== username))
                        this.speak("感谢" + username + "赠送的礼物");
                }

                this.addMsg({
                    type: "gift",
                    username,
                    giftName,
                    num
                })
            })
        })

        live.on('close', () => this.addMsg("Disconnected"));
    }

    // mute
    switchSound = () => {
        if(this.state.sound){
            this.setState({ sound: false });
            speechSynthesis.cancel();
        }else {
            this.setState({ sound: true });
        }
    }

    switchLog = () => {
        if(!this.state.log){
            this.setState({
                msgShowing: this.filterMsg(this.state.msgList, true),
                log: true
            })
        }else {
            this.setState({
                msgShowing: this.filterMsg(this.state.msgList, false),
                log: false
            })
        }
    }

    cleanLog = () => {
        this.setState({
            msgList: [{type: "init", content: "Connected to room: " + this.props.roomId}],
            msgShowing: [<li key={this.count}><p>已连接到房间</p></li>]
        });

        speechSynthesis.cancel();
    }

    render() {
        return(
            <div className='Wrapper'>
                <ul id='danmuArea'>
                    { this.state.msgShowing }
                </ul>
                <div className='btns'>
                    <button className='mainBtn' id='refresh' onClick={ this.cleanLog }>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi" viewBox="0 0 16 16">
                            <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                        </svg>
                    </button>
                    <button className='mainBtn' id='gift' onClick={ this.switchLog }>
                        <svg xmlns="http://www.w3.org/2000/svg" fill={this.state.log ? "#fab1a0" :"currentColor"} className="bi" viewBox="0 0 16 16">
                            <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 14.5V7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 4v2h6V4H1zm8 0v2h6V4H9zm5 3H9v8h4.5a.5.5 0 0 0 .5-.5V7zm-7 8V7H2v7.5a.5.5 0 0 0 .5.5H7z"/>
                        </svg>
                    </button>
                    <button className='mainBtn' id='mute' onClick={ this.switchSound }>
                        {
                            this.state.sound
                                ?
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#2ed573" className="bi" viewBox="0 0 16 16">
                                    <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                                    <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
                                    <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                                </svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" fill='#ee5253' className="bi" viewBox="0 0 16 16">
                                    <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/>
                                </svg>
                        }
                    </button>
                    <button className='mainBtn' id='exit' onClick={ () => this.props.selectRoom(-1) }>
                        {
                            <svg xmlns="http://www.w3.org/2000/svg" fill='currentColor' className="bi" viewBox="0 0 16 16">
                                <path d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                                <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                            </svg>
                        }
                    </button>
                </div>
            </div>

        );
    };
}

export default MainContent;