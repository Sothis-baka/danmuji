import React from "react";
const { LiveWS } = require('bilibili-live-ws');
const speechSynthesis = window.speechSynthesis;

const lang = 'zh';

class MainContent extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            danMu: [],
            enter: [],
            enter_effect: "",
            special_enter: "",
            gift: [],
            expand: false,
            sound: false,
            giftOnly: false
        }

        this.key=0;
    }

    componentDidMount() {
        // set up stream
        const live = new LiveWS(Number(this.props.roomId));
        this.live = live;

        live.on('open', () => {
            if(this.state.sound){
                const temp = new SpeechSynthesisUtterance("已连接到直播间");
                temp.lang = lang;
                speechSynthesis.speak(temp);
            }

            console.log("Connected");
        });

        live.on('live', () => {
            // live.on('heartbeat', console.log);

            live.on('DANMU_MSG', (data) => {
                const msg = {};
                msg.username = data.info[2][1];
                msg.userId = data.info[2][0];
                msg.content = data.info[1];
                if(data.info[3].length > 0){
                    msg.medal_name = data.info[3][1];
                    msg.medal_level = data.info[3][0];
                }
                msg.key = ++this.key;

                this.addMsg('danMu', msg);
            })

            live.on('SEND_GIFT', (data) => {
                const msg = {};
                msg.username = data.data['uname'];
                msg.giftname = data.data['giftName'];
                msg.num = data.data['num'];
                msg.userIcon = data.data['face'];
                msg.key = ++this.key;

                this.addMsg('gift', msg);
            })

            live.on('COMBO_SEND', (data) => {
                this.addMsg('gift_combo', data);
            })

            live.on('INTERACT_WORD', (data) => {
                this.addMsg('enter_effect', data.data['uname']);
            })

            live.on('ENTRY_EFFECT', (data) => {
                let msg =  data.data['copy_writing'];
                msg = msg.replace('<%', '');
                msg = msg.replace('%>', '');

                this.addMsg('special_enter', msg)
            })
        })

        live.on('close', () => console.log("Disconnected"));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // after page update, automatically scroll to bottom.
        const element = document.getElementById('danMuArea');
        element.scrollTop = element.scrollHeight;
    }

    addMsg = (type, data) => {
        switch (type){
            case 'danMu':
                const danMu = this.state.danMu;
                danMu.push(data);

                if(this.state.sound){
                    const temp = new SpeechSynthesisUtterance(`${data.username}说：${data.content}`);
                    temp.lang = lang;
                    speechSynthesis.speak(temp);
                }

                this.setState({ danMu });
                break;
            case 'gift':
                const gift = this.state.gift;

                if(this.state.sound){
                    const username = data.username;
                    // 如果连续赠送礼物只读第一次， 等待b站客户端发送的combo send讯息
                    if(gift.length === 0 || gift[gift.length-1].username !== username){
                        const temp = new SpeechSynthesisUtterance(`感谢${data.username}赠送的${data.num}个${data.giftname}`);
                        temp.lang = lang;
                        speechSynthesis.speak(temp);
                    }
                }

                gift.push(data);
                this.setState({ gift })
                break;
            case 'gift_combo':
                if(this.state.sound){
                    const temp = new SpeechSynthesisUtterance(`感谢${data.data['uname']}连续赠送的${data.data['combo_num']}个${data.data['gift_name']}`);
                    temp.lang = lang;
                    speechSynthesis.speak(temp);
                }
                break;
            case 'enter_effect':
                if(this.state.sound){
                    const temp = new SpeechSynthesisUtterance(`${data}进入了直播间`);
                    temp.lang = lang;
                    speechSynthesis.speak(temp);
                }
                this.setState({ enter_effect: data });
                break;
            case 'special_enter':
                if(this.state.sound){
                    const temp = new SpeechSynthesisUtterance(data);
                    temp.lang = lang;
                    speechSynthesis.speak(temp);
                }
                this.setState({ special_enter: data });
                break;
            default:
                // won't reach
                break;
        }
    }

    getShowing = () => {
        const showing = [];
        if(!this.state.giftOnly){
            const danMu = this.state.danMu;
            if(danMu.length < 20){
                showing.push(<li key='0'>已连接到直播间</li>)
            }

            const needed = danMu.length >= 20 ? danMu.slice(this.state.danMu.length-20) : danMu.slice(0);
            for(let temp of needed){
                showing.push(<li key={ temp.key }><div className='medal'><span className='medalName'>{ temp.medal_name }</span> <span className='medalLevel'>{ temp.medal_level }</span></div> <a href={ 'https://space.bilibili.com/' + temp.userId } target='_blank' rel='noreferrer'>{ temp.username }</a>：{ temp.content }</li>)
            }

            if(this.state.special_enter){
                showing.push(<li className='enterEffect' key='-2'><span className='specialEnter'>{this.state.special_enter}</span></li>)
            }

            // user enter room
            if(this.state.enter_effect){
                showing.push(<li className='enterEffect' key='-1'><span className='username'>{this.state.enter_effect}</span> 进入了直播间</li>)
            }

            // send gift
            const gift = this.state.gift;
            if(gift.length > 0) {
                const lastOne = gift[gift.length - 1];
                showing.push(<li className='giftDisplay' key={ lastOne.key }><img className='userIcon' src={ lastOne.userIcon } alt=""/> <span className='username'>{ lastOne.username }</span> 赠送了 <span className='giftNum'>{ lastOne.num }</span> 个 <span className='giftName'>{ lastOne.giftname }</span></li>)
            }
        }else {
            // gift only return value
            const gift = this.state.gift;
            const users = new Map();

            for(let temp of gift){
                if(users.has(temp.username)){
                    const map = users.get(temp.username);
                    if(map.has(temp.giftname)){
                        map.set(temp.giftname, map.get(temp.giftname) + temp.num);
                    }else {
                        map.set(temp.giftname, temp.num);
                    }
                }else {
                    const map = new Map();
                    map.set('face', temp.userIcon);
                    map.set(temp.giftname, temp.num);
                    users.set(temp.username, map);
                }
            }

            let index = 0;
            for(let singleUser of users.keys()){
                const map = users.get(singleUser);
                const icon = map.get('face');

                for(let singleGift of map.keys()){
                    if(singleGift === 'face'){
                        continue;
                    }
                    showing.push(<li className='giftDisplay' key={ ++index }><img className='userIcon' src={ icon } alt=""/> <span className='username'>{ singleUser }</span> 赠送了 <span className='giftNum'>{ map.get(singleGift) }</span> 个 <span className='giftName'>{ singleGift }</span></li>)
                }
            }
        }

        return showing;
    }

    switchBtnGroup = () => {
        this.setState({ expand: !this.state.expand })
    }

    switchSound = () => {
        speechSynthesis.cancel();

        this.setState({ sound: !this.state.sound })
    }

    switchGiftOnly = () => {
        this.setState({ giftOnly: !this.state.giftOnly })
    }

    render() {
        const expand = this.state.expand;

        return(
            <div id='mainContent'>
                <ul id='danMuArea'>
                    { this.getShowing() }
                </ul>
                <ul id='btnList'>
                    <li className={ expand ? "" : "conceal" } onClick={ this.switchGiftOnly }>
                        <svg xmlns="http://www.w3.org/2000/svg" id='giftBtn' className={this.state.giftOnly ? "focus" : ""} fill="currentColor" viewBox="0 0 16 16">
                            <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zm6 4v7.5a1.5 1.5 0 0 1-1.5 1.5H9V7h6zM2.5 16A1.5 1.5 0 0 1 1 14.5V7h6v9H2.5z"/>
                        </svg>
                    </li>
                    <li className={ expand ? "" : "conceal" } onClick={ this.switchSound }>
                        {
                            this.state.sound
                                ? <svg xmlns="http://www.w3.org/2000/svg" id='soundBtnOn'  className={this.state.sound ? "focus" : ""} fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                                    <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
                                    <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                                </svg>
                                : <svg xmlns="http://www.w3.org/2000/svg" id='soundBtnOff' fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/>
                                </svg>
                        }
                    </li>
                    <li className={ expand ? "" : "conceal" } onClick={ () => {
                        if(this.state.sound){
                            this.switchSound();
                        }

                        setTimeout(() => {
                            this.props.setRoomId(-1)
                        }, 500);
                    } }>
                        <svg xmlns="http://www.w3.org/2000/svg" id="exitBtn" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                            <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                        </svg>
                    </li>
                    <li onClick={ this.switchBtnGroup }>
                        <svg xmlns="http://www.w3.org/2000/svg" id="expandBtn" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                        </svg>
                    </li>
                </ul>
            </div>
        );
    }
}

export default MainContent;