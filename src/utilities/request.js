/* 
* Request 
* @module Utilities 
* @flow  
*/

import { isObject } from 'lodash';
import { NetInfo, Platform, Alert, Linking } from 'react-native';

export type Props = {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  headers?: Object;
  body?: Object;
};

export function isNetworkConnected() {
  if (Platform.OS === 'ios') {
    return new Promise((resolve) => {
      const handleFirstConnectivityChangeIOS = (isConnected) => {
        NetInfo.isConnected.removeEventListener('connectionChange', handleFirstConnectivityChangeIOS);
        resolve(isConnected);
      };
      NetInfo.isConnected.addEventListener('connectionChange', handleFirstConnectivityChangeIOS);
    });
  }

  return NetInfo.isConnected.fetch();
}

// $FlowIssue
export default function ({ path: url, method = 'GET', body = null, headers = {}, noInternetCheck = false }: Props) {
  return isNetworkConnected()
    .then((isConnected) => {
      if (isConnected) {
        window.LOGGER('request', url);
        return fetch(url, {
          method,
          body: body && isObject(body) && !(body instanceof FormData) ? JSON.stringify(body) : body,
          headers,
        })
          .then(({ _bodyText }) => {

            if (_bodyText) {
              return _bodyText;
            }
            return Promise.resolve();
          })
          .catch((error) => Promise.reject(error));
      } 

      if (!noInternetCheck) {
        NoInternetConnection();
      }
    })
    .catch((e) => {
      alert(e.message);
    });
}

export const NoInternetConnection = () => {
  Alert.alert(
    'Нет интернет соединения',
    'Проверьте ваше текущее интернет соединение и повторите попытку',
    [{ 
      text: 'Настройки', 
      onPress: () => {
        Linking.openURL('app-settings:');
      },
    }, {
      text: 'Отмена', 
      onPress: () => {}, 
      style: 'cancel',
    }],
    { 
      cancelable: false,
    },
  )
}
