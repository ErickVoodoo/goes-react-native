import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { isNil } from 'lodash';
import { makeTimeToReadableFormat } from '../utilities/time';

export const NextTransport = ({ minutes, time }: { minutes: Object, time: Object }) => {
  return (!isNil(minutes) && !!time &&
    <View style={styles.badge}>
      <Text style={styles.badge__minutes}>
        {makeTimeToReadableFormat(minutes)}
      </Text>
      <Text style={styles.badge__time}>
        {time}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge__minutes: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  badge__time: {
    fontSize: 12,
  },
});
