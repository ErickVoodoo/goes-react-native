/* 
* Loader 
* @module Components 
* @flow  
*/

import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Fade } from './';

type IProps = {
  children: Object,
  isLoading: boolean,
  style: Object,
  background: boolean,
};

export const Loader = ({ children, isLoading, style, background }: IProps): void =>
  (<View style={[styles.container, style, background ? styles.height_0 : {}]}>
    { isLoading ?
      (background ?
        <View style={{ position: 'relative', width: '100%', height: 'auto' }}>
          <ActivityIndicator style={{ position: 'absolute', height: '100%', width: ' 100%', top: 0, left: 0, backgroundColor: '#fff', zIndex: 1 }}/>
          {children}
        </View> :
        <ActivityIndicator />
      ) :
        <Fade delay={100} duration={300}>
          {children}
        </Fade>
    }
  </View>);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  height_0: {
    height: 'auto',
  },
});
