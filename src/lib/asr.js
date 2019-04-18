/**
  * @file: asr.js
  * @author: why
  * @date: 2019-04-17
*/
import Taro from '@tarojs/taro';

let requestId = 0;
const recorder = Taro.getRecorderManager();
recorder.onStop(res => {
    Taro.uploadFile({
        url: 'https://chiyuanyuan.com/aiwritter/resolve_voice',
        filePath: res.tempFilePath,
        name: 'file'
    }).then(res => {
        const data = JSON.parse(res.data);
        const text = data.text;
        cb(text || 'fail');
    });
});

let cb = text => {}

export const start = () => {
    recorder.start({
        sampleRate: 16000,
        format: 'aac'
    });
};

export const stop = callback => {
    requestId ++;
    const currentRequestId = requestId;
    cb = text => {
        if (currentRequestId === requestId) {
            callback(text);
        }
    }
    recorder.stop();
}