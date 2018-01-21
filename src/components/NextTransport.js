import React from 'react';
import { StyleSheet, View } from 'react-native';
import styled, { css } from 'styled-components/native';
import { ifProp } from 'styled-tools';
import { isNil } from 'lodash';
import { makeTimeToReadableFormat } from '../utilities/time';

const Minutes = styled.Text`
  font-size: 12px;
  font-weight: bold;

  ${ifProp('small',
    css`
      font-size: 10px;
      font-weight: bold;
    `,
  )}
`;

const Time = styled.Text`
  font-size: 12px;

  ${ifProp('small',
    css`
      font-size: 10px;
    `,
  )}
`;

export const NextTransport = ({ minutes, time, small }: { minutes: Object, time: Object, small: boolean }) => {
  return (!isNil(minutes) && !!time &&
    <View style={styles.badge}>
      <Minutes small={small}>
        {makeTimeToReadableFormat(minutes)}
      </Minutes>
      <Time small={small}>
        {time}
      </Time>
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
});
