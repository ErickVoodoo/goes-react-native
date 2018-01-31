/* 
* Direction 
* @module Components 
* @flow  
*/

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ListItem, NextTransport, TransportIcon } from '../';
import { getTransportColor } from '../../utilities/parser'

import Colors from '../../constants/colors';

type IProps = {
  direction: string,
  transport: string,
  type: string,
  nextPrev: Object,
  onPress: Function,
};

export const StopDirection = ({ type, direction, transport, nextPrev, onPress }: IProps) => (
  <View
    style={styles.container}
  >
    <View
      style={[ styles.item__type, { backgroundColor: getTransportColor(type) }]}
    />
    <ListItem
      style={styles.item_info}
      title={direction}
      leftIcon={<TransportIcon
        number={transport}
        type={type}
      />}
      badge={nextPrev ? { element: <NextTransport minutes={nextPrev.minutes} time={nextPrev.time} /> } : null}
      onPress={onPress}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row', 
    alignItems: 'center',
    width: '100%', 
    borderBottomColor: Colors.lightGrayColor, 
    borderBottomWidth: 1, 
    height: 52, 
    backgroundColor: '#fff',
  },
  listItem: {
    height: 52, 
    maxHeight: 52, 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-start',
  },
  opacity: { 
    width: 40, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  item__type: {
    width: 6,
    height: '100%',
    backgroundColor: Colors.busColor,
    marginTop: 1,
    marginBottom: 1,
  },
  item_info: {
    flex: 1,
  },
});