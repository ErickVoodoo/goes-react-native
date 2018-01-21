/* 
* App 
* @module Root 
* @flow  
*/

import React from 'react';
import { StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { Provider } from 'react-redux';

import { store } from './src/store/store';
import { RootNavigator } from './src/navigation/Router';

const Container = styled.View`
  flex: 1;
  display: flex;
`;

export default () => (
  <Provider store={store}>
    <Container>
      <StatusBar
        barStyle="light-content"
      />
      <RootNavigator />
    </Container>
  </Provider>
);