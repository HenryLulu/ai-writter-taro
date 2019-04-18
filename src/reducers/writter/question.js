/**
  * @file: question.js
  * @author: why
  * @date: 2019-04-16
*/

import {handleActions} from 'redux-actions';

const defaultList = [
    {
        key: 1,
        text: '今天心情怎么样呢？',
        answer: ''
    }, {
        key: 2,
        text: '今天吃了什么呀？',
        answer: '擦撒上打算打算打算打算打算的撒打算打算打算打算打算打算打算的'
    }, {
        key: 3,
        text: '今天最有意义的事是什么呢',
        answer: ''
    }, {
        key: 4,
        text: '今天最烦的事又是什么呢',
        answer: ''
    }, {
        key: 5,
        text: 'freestyle形容今天吧',
        answer: ''
    }, {
        key: 6,
        text: '给明天立个flag吧',
        answer: ''
    }
];

export default handleActions({
    'QUESTION_NEXT': (state, action) => ({
        currentIndex: state.currentIndex + 1,
        list: state.list
    })
}, {
    currentIndex: 1,
    list: defaultList
});