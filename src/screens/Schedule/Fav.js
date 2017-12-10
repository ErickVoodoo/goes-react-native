/* 
* Fav 
* @module Screens/Schedule 
* @flow  
*/

import React from 'react';
import EventEmitter from 'react-native-eventemitter';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { View, TouchableOpacity } from 'react-native';

import Colors from '../../constants/colors';

export class Fav extends React.Component {
  state = {
    isFavorite: false,
  };

  componentWillMount = () => {
    EventEmitter.on('change_favorite_status', (isFavorite) => {
      this.setState({
        isFavorite,
      });
    });
  }

  componentWillUnmount = () => {
    EventEmitter.removeAllListeners('change_favorite_status');
    EventEmitter.removeAllListeners('favorite');
    EventEmitter.removeAllListeners('unfavorite');
  }

  render() {
    const { isFavorite } = this.state;

    return (
      <View style={{ paddingLeft: 16, paddingRight: 16, height: '100%' }}>
        <TouchableOpacity
          style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          activeOpacity={0.2}
          onPress={() => {
            EventEmitter.emit(isFavorite ? 'unfavorite' : 'favorite');
          }}
        >
          <MaterialIcons
            name={!isFavorite ? 'favorite-border' : 'favorite'}
            size={24}
            color={Colors.noticeText}
          />
        </TouchableOpacity>
      </View>
    );
  }
}