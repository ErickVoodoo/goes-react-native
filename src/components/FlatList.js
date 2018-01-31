/* 
* FlatList 
* @module Components 
* @flow  
*/

import React from 'react';
import EventEmitter from 'react-native-eventemitter';
import { FlatList as NativeFlatList } from 'react-native';

export class FlatList extends React.Component {
  onScroll = () => {
    const { event } = this.props;
    if (event) {
      EventEmitter.emit(event);
    }
  }

  render() {
    return (
      <NativeFlatList 
        {...this.props}
        onScroll={this.onScroll}
      />
    );
  }
}