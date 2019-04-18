/**
  * @file: speech.js
  * @author: why
  * @date: 2019-04-17
*/
import Taro from '@tarojs/taro';

const player = Taro.createInnerAudioContext();
player.obeyMuteSwitch = false;
player.autoplay = true;

export const speech = (text, cb) => {
    cb = cb || (() => {});
    player.onEnded(res => {
        cb();
    });
    player.onPlay(res => {
        console.log(res)
    });
    player.onError(res => {
        console.log(res)
        cb();
    });
    player.src = `https://chiyuanyuan.com/aiwritter/tts.mp3?text=${encodeURI(text)}`;
}

export const stop = () => {
    player.stop();
}