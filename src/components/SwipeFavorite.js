/* 
* SwipeFavorite 
* @module Components 
* @flow  
*/

import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';

import { SETTINGS_KEYS } from '../constants/config';

type IProps = {
  isFavorite: boolean;
  onFavorite: Function;
}

export const SwipeFavorite = ({ isFavorite, onFavorite }: IProps) => (
  <View style={[styles.container, { backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]] }]}>
    <TouchableOpacity
      style={styles.button}
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
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    width: 90,
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
});
