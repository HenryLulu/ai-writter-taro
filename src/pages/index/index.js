import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Input, Textarea } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import './index.less'

const questions = [
    {
        index: 1,
        text: '今天心情怎么样？'
    }, {
        index: 2,
        text: '今天心情怎么样？'
    }, {
        index: 3,
        text: '今天心情怎么样？'
    }, {
        index: 4,
        text: '今天心情怎么样？'
    }, {
        index: 5,
        text: '今天心情怎么样？'
    }, {
        index: 6,
        text: '今天心情怎么样？'
    }
];

export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {
            questions: [
                {
                    index: 1,
                    text: '今天心情怎么样？'
                }, {
                    index: 2,
                    text: '今天心情怎么样？'
                }, {
                    index: 3,
                    text: '今天心情怎么样？'
                }, {
                    index: 4,
                    text: '今天心情怎么样？'
                }, {
                    index: 5,
                    text: '今天心情怎么样？'
                }, {
                    index: 6,
                    text: '今天心情怎么样？'
                }
            ]
        };
        this.recorder = Taro.getRecorderManager();
        this.recorder.onStop(res => {
            this.sendRecord(res.tempFilePath);
        });
    }

    startRecord = e => {
        this.recorder.start({
            sampleRate: 16000,
            format: 'aac'
        });
        // Taro.startRecord().then(res => {
        //     this.tempFilePath = res.tempFilePath;
        //     this.sendRecord(res.tempFilePath);
        // })
    }

    endRecord = e => {
        this.recorder.stop();
        // Taro.stopRecord()
    }

    sendRecord = filePath => {
        console.log(filePath);
        Taro.uploadFile({
            url: 'http://localhost:8888/resolve_voice',
            filePath,
            name: 'file'
        }).then(res => {
            console.log(res)
        });
    }

    render() {
        const now = new Date();
        return <View>
            <View className="header">{`${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`}</View>
            <View className="gird-wrapper">
                {questions.map(Q => <View key={Q.index} className="gird">
                    <View className="question">{Q.text}</View>
                    <View className="answer">
                        <Textarea type='text' value={Q.answer || ''}/>
                    </View>
                </View>)}
            </View>
            <Button
                onTouchStart={this.startRecord}
                onTouchEnd={this.endRecord}
            >按住说话</Button>
        </View>
    }
}