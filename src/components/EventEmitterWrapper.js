/* 
* EventEmitterWrapper 
* @module Components 
* @flow  
*/

import React from 'react';
import EventEmitter from 'react-native-eventemitter';
import { Actions } from 'react-native-router-flux';

type IProps = {
  children: Object,
}

export class EventEmitterWrapper extends React.Component {
  props: IProps;

  componentWillMount = () => {
    EventEmitter.on('open_settings', this.openSettings);
  }

  componentWillUnmount = () => {
    EventEmitter.removeAllListeners('open_settings');
  }

  openSettings = () => {
    Actions.SCREEN_SETTINGS();
  }

  render() {
    const { children } = this.props;

    return (
      children
    );
  }
}
