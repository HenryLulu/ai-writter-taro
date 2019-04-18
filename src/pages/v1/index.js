import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Input, Textarea, ScrollView, Canvas } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import './index.less';

export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {
            mode: 'siri', // grid | siri
            console: '按住说话',
            status: 'init', // init / recording / loading,
            currentQuestionIndex: 0,
            questions: [
                {
                    index: 1,
                    text: '今天心情怎么样呢？',
                    answer: ''
                }, {
                    index: 2,
                    text: '今天吃了什么呀？',
                    answer: ''
                }, {
                    index: 3,
                    text: '今天最有意义的事是什么呢',
                    answer: ''
                }, {
                    index: 4,
                    text: '今天最烦的事又是什么呢',
                    answer: ''
                }, {
                    index: 5,
                    text: 'freestyle形容今天吧',
                    answer: ''
                }, {
                    index: 6,
                    text: '给明天立个flag吧',
                    answer: ''
                }
            ],
            siriContext: [],
            currentSiriContextKey: '',
            shareShown: false
        };
        this.recorder = Taro.getRecorderManager();
        this.recorder.onStop(res => {
            this.sendRecord(res.tempFilePath);
        });
    }

    componentDidMount() {
        const now = new Date();
        const starter = `大宝贝，欢迎来到语音日记，今天是${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日，咱们开始吧`;
        this.pushSiriContext([{
            side: 'left',
            text: starter
        }]);
        this.bar(starter, () => {
            this.pushSiriContext([{
                side: 'left',
                text: this.state.questions[this.state.currentQuestionIndex].text
            }]);
            this.bar(this.state.questions[this.state.currentQuestionIndex].text)
        });
    }

    pushSiriContext = (context, callback) => {
        const cb = callback || (() => {});
        const key = `i${Math.random().toString().slice(2)}`;
        this.setState({
            siriContext: [
                ...this.state.siriContext,
                ...context.map(C => ({
                    ...C,
                    key
                }))
            ]
        }, () => {
            if (context[0].side === 'left') {
                this.setState({
                    currentSiriContextKey: key
                });
            }
            cb();
        });
    }

    startRecord = e => {
        if (this.state.status !== 'init') {
            return;
        }
        this.recorder.start({
            sampleRate: 16000,
            format: 'aac'
        });
        this.setState({status: 'recording'});
    }

    endRecord = e => {
        this.recorder.stop();
        this.setState({status: 'loading'});
    }

    sendRecord = filePath => {
        console.log(filePath);
        Taro.uploadFile({
            // url: 'http://localhost:8888/resolve_voice',
            url: 'https://chiyuanyuan.com/aiwritter/resolve_voice',
            filePath,
            name: 'file'
        }).then(res => {
            const data = JSON.parse(res.data);
            let c = '';
            if (data.err_no === 0) {
                if (data.type === 0) {
                    c = `输入：${data.text}`;
                    this.handleInput(data.text);
                } else {
                    c = `指令：${data.commond}`;
                    this.handleCommond(data.commond, data.text);
                }
            } else {
                c = data.err_msg;
                this.pushSiriContext([{
                    side: 'left',
                    text: '没听清，再说一次好吗？'
                }]);
            }
            this.setState({
                console: c,
                status: 'init'
            });
        });
    }

    handleCommond = (commond, text) => {
        switch (commond) {
            case 'pre':
                this.pushSiriContext([{
                    side: 'right',
                    text
                }]);
                setTimeout(() => {
                    this.pre();
                }, 1000);
                break;
            case 'next':
                this.pushSiriContext([{
                    side: 'right',
                    text
                }]);
                setTimeout(() => {
                    this.next();
                }, 1000);
                break;
            case 'clear':
                this.setState({
                    questions: this.state.questions.map((Q, index) => ({
                        ...Q,
                        answer: this.state.currentQuestionIndex === index ? '' : Q.answer
                    }))
                });
                this.pushSiriContext([{
                    side: 'left',
                    text: '好的，答案已清除'
                }]);
                break;
        }
    }

    pre = () => {
        const currentQuestionIndex = this.state.currentQuestionIndex;
        if (currentQuestionIndex === 0) {
            this.pushSiriContext([{
                side: 'left',
                text: '已经是第一个问题了'
            }]);
        } else {
            this.setState({
                currentQuestionIndex: currentQuestionIndex - 1
            }, () => {
                this.pushSiriContext([{
                    side: 'left',
                    text: '好的，回到上个问题'
                }, {
                    side: 'left',
                    text: this.state.questions[this.state.currentQuestionIndex].text
                }]);
                this.bar(this.state.questions[this.state.currentQuestionIndex].text);
            });
        }
    }

    next = () => {
        const currentQuestionIndex = this.state.currentQuestionIndex;
        const lastIndex = this.state.questions.length - 1;
        if (currentQuestionIndex === lastIndex) {
            this.pushSiriContext([{
                side: 'left',
                text: '今天的日记写完啦'
            }]);
        } else {
            this.setState({
                currentQuestionIndex: currentQuestionIndex + 1
            }, () => {
                this.pushSiriContext([{
                    side: 'left',
                    text: this.state.questions[this.state.currentQuestionIndex].text
                }]);
                this.bar(this.state.questions[this.state.currentQuestionIndex].text);
            });    
        }
    }

    jump = index => {
        this.setState({currentQuestionIndex: index}, () => {
            this.pushSiriContext([{
                side: 'left',
                text: this.state.questions[this.state.currentQuestionIndex].text
            }]);
            this.bar(this.state.questions[this.state.currentQuestionIndex].text);
        });
    }

    bar = (text, cb) => {
        cb = cb || (() => {});
        this.player = Taro.createInnerAudioContext();
        this.player.obeyMuteSwitch = false;
        this.player.autoplay = true;
        this.player.onEnded(res => {
            cb();
        });
        this.player.onPlay(res => {
            console.log(res)
        });
        this.player.onError(res => {
            console.log(res)
            cb();
        });
        this.player.src = `https://chiyuanyuan.com/aiwritter/tts.mp3?text=${encodeURI(text)}`
    }

    handleInput = data => {
        this.setState({
            questions: this.state.questions.map((Q, index) => ({
                ...Q,
                answer: this.state.currentQuestionIndex === index ? data : Q.answer
            }))
        }, () => {
            this.pushSiriContext([{
                side: 'right',
                text: data
            }]);
            setTimeout(() => {
                this.next();
            }, 1000);
        });
    }

    handleType = (current, e) => {
        this.setState({
            questions: this.state.questions.map((Q, index) => ({
                ...Q,
                answer: current.index === Q.index ? e.currentTarget.value : Q.answer
            }))
        });
    }

    drawShare = () => {
        let anchorY = 40;
        const fillText = (ctx, text) => {
            const lineLen = 22;
            while (text.length > 0) {
                ctx.fillText(text.slice(0, lineLen), 20, anchorY);
                anchorY += 20;
                text = text.slice(lineLen)
            }
        }

        this.setState({shareShown: true}, () => {
            const ctx = Taro.createCanvasContext('share', this.$scope);
            // w: 300

            ctx.setFontSize(12);
            this.state.questions.forEach(Q => {
                if (true || Q.answer) {
                    ctx.setFillStyle('#000');
                    fillText(ctx, '--------------------');
                    fillText(ctx, Q.text);
                    ctx.setFillStyle('#333');
                    fillText(ctx, Q.answer);
                }
            });
            ctx.draw()
        });
    }

    downShare = () => {
        Taro.canvasToTempFilePath({
            canvasId: 'share'
        }, this.$scope).then(res => {
            Taro.saveImageToPhotosAlbum({
                filePath: res.tempFilePath
            }).then(() => {
                Taro.showToast({
                    title: '保存成功'
                })
            });
        })
    }

    closeShare = () => {
        this.setState({shareShown: false});
    }

    killTouch = e => {
        e.stopPropagation();
        e.preventDefault();
    }

    render() {

        const ControlBar = <View className="control-bar">
            {this.state.shareShown && <View className="share-mask" onTouchMove={this.killTouch}>
                <Canvas canvasId="share" className="share-canvas" style="width: 300px; height: 500px;"
                    disableScroll={true}/>
                <View className="btn-wrapper">
                    <View className="btn-down btn" onClick={this.downShare}></View>
                    <View className="btn-close btn" onClick={this.closeShare}></View>
                </View>
            </View>}
            <View className="control-btn-wrapper">
                {this.state.mode === 'grid' && <View className="btn-siri btn-direct"
                    onClick={() => {this.setState({mode: 'siri'})}}></View>}
                {this.state.mode === 'siri' && <View className="btn-grid btn-direct"
                    onClick={() => {this.setState({mode: 'grid'})}}></View>}
                <View className="btn-pre btn-direct" onClick={this.pre}></View>
                <View className={`speech-btn ${this.state.status}`}
                    onTouchStart={this.startRecord}
                    onTouchEnd={this.endRecord}
                ></View>
                <View className="btn-next btn-direct" onClick={this.next}></View>
                <View className="btn-save btn-direct" onClick={this.drawShare}></View>
            </View>
            <View className="log">按住说话</View>
        </View>;

        const now = new Date();
        return <View className="body">
            {this.state.mode === 'grid'
            ? <View className="gird-mode">
                <View className="header">{`${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`}</View>
                <View className="gird-wrapper">
                    {this.state.questions.map((Q, index) => <View key={Q.index}
                        className={`gird ${index === this.state.currentQuestionIndex ? 'current' : ''}`}>
                        <View className="question"
                            onClick={this.jump.bind(this, index)}>{Q.text}</View>
                        <Textarea className="text" type='text' value={Q.answer || ''}
                            onFocus={this.jump.bind(this, index)}
                            onInput={this.handleType.bind(this, Q)}
                        />
                    </View>)}
                </View>
                {ControlBar}
            </View>
            : <View className="siri-mode">
                <ScrollView className="context-wrapper"
                    scrollY={true}
                    scrollIntoView={this.state.currentSiriContextKey}
                    scrollWithAnimation={true}
                >
                    {this.state.siriContext.map(C => <View id={C.key} className="context-item-wrapper">
                        <View className={`context-item ${C.side}`}>{C.text}</View>
                    </View>)}
                    <View className="holder"></View>
                </ScrollView>
                {ControlBar}
            </View>}
        </View>
    }
}