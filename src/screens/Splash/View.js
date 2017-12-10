/* 
* Splash 
* @module Sreens 
* @flow  
*/

import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { View, Animated, Image, StyleSheet, ActivityIndicator } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    position: 'absolute',
    flex: 1,
  },
});

type IProps = {
  backgroundAnimation: any,
  iconAnimation: any,
}

export const Screen = ({ backgroundAnimation, iconAnimation }: IProps) => (
  <View style={styles.container}>
    <Animated.View
      style={{
        position: 'absolute',
        height: '100%',
        width: '100%',
        opacity: backgroundAnimation,
      }}
    >
      <LinearGradient
        style={{ flex: 1 }}
        colors={['#9029ff', '#2196F3']}
        start={{ x: 0, y: 0.1 }} 
        end={{ x: 0.1, y: 1 }}
      />
    </Animated.View>
    <Animated.View
      style={{
        width: 200,
        height: 200,
        opacity: iconAnimation,
      }}
    >
      <Image 
        source={require('../../../assets/icons/icon.png')}
        style={{
          width: 200,
          height: 200,
        }}
      />
    </Animated.View>
  </View>
);