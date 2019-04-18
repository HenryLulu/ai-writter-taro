/**
  * @file: index.js
  * @author: why
  * @date: 2019-04-15
*/

import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import moment from 'moment';

import Card from './components/questionCard/index.js';

import './index.less';

@connect(({question}) => ({question}))
export default class C extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    render() {
        const {currentIndex, list} = this.props.question;
        return <View className="body">
            <View className="top-bar">
                <Text className="date">{moment(this.$router.params.date || '20190417').format('YYYY-M-D')}</Text>
            </View>
            <View className="content">
                <View className="card-wrapper">
                    {list.map((Q, index) => <View key={Q.key}><Card
                        Q={{...Q, index: index - currentIndex}}
                    /></View>)}
                </View>
            </View>
        </View>
    }
}

