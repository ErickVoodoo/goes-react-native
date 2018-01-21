/* 
* TransportIcon 
* @module Components 
* @flow  
*/

import React from 'react';
import styled, { css } from 'styled-components/native';
import { prop, ifProp } from 'styled-tools';
import { Flex } from './';

import { getTransportColor } from '../utilities/parser';

type IProps = {
  number: string;
  type: string;
  small: boolean;
}

const Container = styled(Flex)`
  border-radius: 5;
  border-width: 1.5;
  width: 36px;
  height: 36px;
  margin-right: 8px;
  border-color: ${prop('color')};

  ${ifProp('small',
    css`
      width: 24px;
      height: 24px;
    `,
  )}
`;

const Text = styled.Text`
  font-size: 14;
  color: ${prop('color')};
  text-align: center;

  ${ifProp('small',
    css`
      font-size: 10;
    `,
  )}
`;

export const TransportIcon = ({ number, type, small }: IProps) => (
  <Container align={'center'} justify={'center'} row color={getTransportColor(type)} small={small}>
    <Text color={getTransportColor(type)} small={small}>
      {number}
    </Text>
  </Container>
);
