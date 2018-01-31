/* 
* Direction 
* @module Components 
* @flow  
*/

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ListItem, NextTransport } from '../';
import { getTransportColor } from '../../utilities/parser'

import Colors from '../../constants/colors';

type IProps = {
  stop: string,
  p: string,
  type: string,
  nextPrev: Object,
  onPress: Function,
};

export const DirectionStop = ({ type, p, stop, nextPrev, onPress }: IProps) => (
  <View
    style={styles.container}
  >
    <View
      style={[ styles.item__type, { backgroundColor: getTransportColor(type) }]}
    />
    <ListItem
      subtitleStyle={!p ? { height: 0 } : {}}
      style={styles.listItem}
      title={stop}
      subtitle={p}
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
  item__type: {
    width: 6,
    height: '100%',
    backgroundColor: Colors.busColor,
    marginTop: 1,
    marginBottom: 1,
  },
});