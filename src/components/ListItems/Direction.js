/* 
* Direction 
* @module Components 
* @flow  
*/

import React from 'react';
import { StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { ListItem, TransportIcon } from '../';
import Colors from '../../constants/colors';

type IProps = {
  key: string,
  direction: string,
  transport: string,
  type: string,
  onPress: Function,
};

export const Direction = ({ key, direction, transport, type, onPress }: IProps) => (
  <ListItem
    key={key}
    title={direction}
    leftIcon={<TransportIcon number={transport} type={type} />}
    onPress={onPress}
    rightIcon={<FontAwesome name='exchange' size={1} />}
    style={styles.listItem}
  />
);

const styles = StyleSheet.create({
  listItem: {
    height: 52, 
    maxHeight: 52, 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrayColor,
  },
});