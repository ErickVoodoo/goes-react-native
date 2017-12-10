/* 
* SwipeFavorite 
* @module Components 
* @flow  
*/

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';

import Colors from '../constants/colors';
import { SETTINGS_KEYS } from '../constants/config';

type IProps = {
  isFavorite: boolean;
  onFavorite: Function;
}

export const SwipeFavorite = ({ isFavorite, onFavorite }: IProps) => (
  <View style={styles.rowBack}>
    <Text />
    <TouchableOpacity
      style={[styles.backRightBtn, styles.backRightBtnRight, { backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]] }]}
      onPress={() => onFavorite(isFavorite ? 0 : 1)}
      activeOpacity={0.8}
    >
      <Image
        source={isFavorite ? require('../../assets/images/star-white-filled.png') : require('../../assets/images/star-white-border.png')}
        style={{ width: 22, height: 22 }}
      />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  rowBack: {
    alignItems: 'center',
    backgroundColor: Colors.noticeText,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnRight: {
    right: 0,
  },
  textWhite: {
    color: Colors.noticeText,
  },
});
