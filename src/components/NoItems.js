
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import Color from '../constants/colors';

export const NoItems = ({ noIcon = false, message }: { noIcon: boolean, message: string }): void => (
  <View style={styles.container}>
    {!noIcon &&
    <Text style={styles.emoji}>
      🤔
    </Text>}
    <Text style={styles.text}>
      {message || 'Упс, пусто'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '10%',
    paddingRight: '10%',
  },
  emoji: {
    fontSize: 30,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    color: Color.grayColor,
  },
});
