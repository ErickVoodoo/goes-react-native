/* 
* TransportIcon 
* @module Components 
* @flow  
*/

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { getTransportColor } from '../utilities/parser';

type IProps = {
  number: string;
  type: string;
}

export const TransportIcon = ({ number, type }: IProps) => (
  <View style={StyleSheet.flatten([ styles.transportIcon, StyleSheet.create({ i: { borderColor: getTransportColor(type) } }).i ])}>
    <Text style={StyleSheet.flatten([ styles.transportIcon__text, StyleSheet.create({ i: { color: getTransportColor(type) } }).i ])}>
      {number}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  transportIcon: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    borderWidth: 2,
    width: 36,
    height: 36,
    marginRight: 12,
  },
  transportIcon__text: {
    fontSize: 14,
  },
});
