/* 
* Direction 
* @module Components 
* @flow  
*/

import React from 'react';
import { StyleSheet } from 'react-native';

import { ListItem } from '../';
import Colors from '../../constants/colors';

type IProps = {
  p: string,
  n: string,
  onPress: Function,
};

export const Stop = ({ n, p, onPress }: IProps) => (
  <ListItem
    title={n}
    subtitle={p}
    onPress={onPress}
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