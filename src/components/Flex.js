/* 
* Index 
* @module Components/Flex 
* @flow  
*/

import styled, { css } from 'styled-components/native';
import { prop, ifProp } from 'styled-tools';

export const Flex = styled.View`
  display: flex;
  flex-direction: column;
  width: 100%;

  ${ifProp(
    'size',
    css`
      flex: ${prop('size')};
    `,
  )} ${ifProp(
  'row',
  css`
        flex-direction: row;
      `,
)} ${ifProp(
  'align',
  css`
        align-items: ${prop('align')};
      `,
)} ${ifProp(
  'justify',
  css`
        justify-content: ${prop('justify')};
      `,
)};
`;
