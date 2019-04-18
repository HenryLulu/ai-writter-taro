/**
  * @file: index.js
  * @author: why
  * @date: 2019-04-16
*/
import Taro, { Component } from '@tarojs/taro';
import { View, Text, MovableArea } from '@tarojs/components';
import { connect } from '@tarojs/redux';

import {next} from '../../../../actions/writter/question';
import * as speech from '../../../../lib/speech';
import * as asr from '../../../../lib/asr';

import './index.less';

const STATUS = {
    READING: 'reading',
    RECORDING: 'recording',
    RECOGNIZING: 'recognizing',
    FINISHED: 'finished'
};

@connect(({question}) => ({question}))
export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {
            status: STATUS.READING,
            left: 0
        };
    }

    componentDidMount() {
        if (this.props.Q.index === 0) {
            this.speech(this.props.Q.text);
        }
    }

    componentWillReceiveProps(nextProps) {
        const preIndex = this.props.Q.index;
        const nextIndex = nextProps.Q.index;
        if (nextIndex !== preIndex && nextIndex === 0) {
            this.speech(nextProps.Q.text);
        }
    }

    handleMove = e => {
        if (this.props.Q.index !== 0) {
            return;
        }
        const touch = e.touches[0];
        switch (e.type) {
            case 'touchstart':
                this.initLeft = this.state.left;
                this.lastPosition = touch;
                break;
            case 'touchmove':
                const x = touch.pageX - this.lastPosition.pageX;
                this.setState({
                    left: this.state.left + x
                });
                this.lastPosition = touch;
                break;
            case 'touchend':
                const delta = Math.abs(this.state.left - this.initLeft);
                console.log(delta)
                if (delta > 150) {
                    this.next();
                }
                break;
            default: 
                break;
        }
    }

    next = () => {
        this.props.dispatch(next());
        this.break();
    }

    speech = text => {
        speech.speech(text, () => {
            this.setState({status: STATUS.RECORDING});
            asr.start();
        });
    }

    break = () => {
        speech.stop();
        asr.stop(() => {});
    }

    stopRecord = () => {
        this.setState({status: STATUS.RECOGNIZING});
        asr.stop(text => {
            console.log(text);
            this.setState({status: STATUS.FINISHED});
        });
    }

    render() {
        const Q = this.props.Q;
        return <View className="question-card"
            style={{
                display: Q.index < 0 ? 'none' : 'block',
                zIndex: 10 - Q.index,
                transform: `scale(${1 - 0.05 * Q.index})`,
                top: -22 * this.props.Q.index + 'px',
                left: this.state.left + 'px',
            }}
            onTouchStart={this.handleMove}
            onTouchMove={this.handleMove}
            onTouchEnd={this.handleMove}
        >
            <View className="img-area">
                <View className="img"></View>
            </View>
            <View className="main-area">
                <View className="question">{Q.text}</View>
                <View className="answer">{Q.answer}</View>
                <View className="control-bar">
                    {this.state.status === STATUS.READING && <View className="btn disable"
                    >听我说……</View>}
                    {this.state.status === STATUS.RECORDING && <View className="btn"
                        onClick={this.stopRecord}
                    >说完了</View>}
                    {this.state.status === STATUS.RECOGNIZING && <View className="btn disable"
                    >识别中……</View>}
                </View>
            </View>
        </View>;
    }
};