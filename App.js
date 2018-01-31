/* 
* App 
* @module Root 
* @flow  
*/

import React from 'react';
import { StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { Provider } from 'react-redux';
// import PushNotification from 'react-native-push-notification';

import { store } from './src/store/store';
import { RootNavigator } from './src/navigation/Router';

// const { PushNotificationIOS } = NativeModules;

const Container = styled.View`
  flex: 1;
  display: flex;
`;

// PushNotification.configure({
//   // (optional) Called when Token is generated (iOS and Android)
//   onRegister: (token) => {
//     console.log('TOKEN:', token);
//   },
//   // (required) Called when a remote or local notification is opened or received
//   onNotification: (notification) => {
//     console.log('NOTIFICATION:', notification);

//     // process the notification
    
//     // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
//     notification.finish(PushNotificationIOS.FetchResult.NoData);
//   },

//   // IOS ONLY (optional): default: all - Permissions to register.
//   permissions: {
//     alert: true,
//     badge: true,
//     sound: true,
//   },

//   // Should the initial notification be popped automatically
//   // default: true
//   popInitialNotification: true,

//   /**
//     * (optional) default: true
//     * - Specified if permissions (ios) and token (android and ios) will requested or not,
//     * - if not, you must call PushNotificationsHandler.requestPermissions() later
//     */
//   requestPermissions: true,
// });

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