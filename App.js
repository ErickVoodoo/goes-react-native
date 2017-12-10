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
import { Routes } from './src/navigation/Router';

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
      <Routes />
    </Container>
  </Provider>
);

// loadAssetsAsync = async () => {
//   try {
//     window.LOGGER('IMAGES');
//     await cacheAssetsAsync({
//       images: [
//         require('./assets/intro-1.mp4'),
//         require('./assets/intro-2.mp4'),
//         require('./assets/intro-3.mp4'),
//         require('./assets/intro-4.mp4'),
//         require('./assets/images/expo-wordmark.png'),
//         require('./assets/images/bench-white.png'),
//         require('./assets/images/city-selector-background.jpg'),
//         require('./assets/images/bench-gray.png'),
//         require('./assets/images/bench-blue.png'),
//         require('./assets/images/bus-gray.png'),
//         require('./assets/images/bus-blue.png'),
//         require('./assets/images/star-blue-filled.png'),
//         require('./assets/images/star-blue-border.png'),
//         require('./assets/images/star-gray.png'),
//         require('./assets/images/star-white-border.png'),
//         require('./assets/images/star-white-filled.png'),
//       ],
//     });
//     window.LOGGER('FONTS');
//     await Font.loadAsync({
//       MaterialIcons: require('@expo/vector-icons/fonts/MaterialIcons.ttf'),
//     });
//     window.LOGGER('DONE');
//   } catch (e) {
//     console.warn(
//       'There was an error caching assets (see: main.js), perhaps due to a ' +
//         'network timeout, so we skipped caching. Reload the app to try again.'
//     );
//     console.log(e.message);
//   }
// }