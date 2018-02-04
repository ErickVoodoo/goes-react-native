/* 
* Container 
* @module Screens/Splash 
* @flow  
*/

import { compose, lifecycle, withState, withHandlers } from 'recompose';
import { NativeModules, Alert, AlertIOS } from 'react-native'
import EventEmitter from 'react-native-eventemitter';

import { isNetworkConnected, NoInternetConnection } from '../../utilities/request';
import { FREE_IAP } from '../../constants/config';
import { Screen } from './View';
import { PRODUCTS } from './constants';

const { InAppUtils } = NativeModules;

export const IapContainer = compose(
  withState('isLoading', 'setLoading', true),
  withState('products', 'setProducts', []),
  withState('exampleId', 'setExampleId', null),
  withHandlers({
    buyProduct: ({ setLoading }) => identifier => {
      setLoading(true);
      InAppUtils.canMakePayments((canMakePayments) => {
        if (!canMakePayments) {
          setLoading(false);
          Alert.alert('Ошибка.', 'На устройстве нет разрешения на покупку.');
        } else {
          InAppUtils.purchaseProduct(identifier, (error, response) => {
            if (response && response.productIdentifier) {
              Alert.alert('Успешно приобретено!');

              const {
                productIdentifier,
                transactionDate,
                transactionIdentifier,
                transactionReceipt,
              } = response;

              window.DB.insert({
                table: 'iap',
                values: response, 
              });

              window.IAP.push({
                productIdentifier,
                transactionDate,
                transactionIdentifier,
                transactionReceipt,
              });
            }

            setLoading(false);
          });
        }        
      });
    },
    getFree: ({ setLoading }) => () => {
      setLoading(true);
      AlertIOS.prompt(
        'Введи промо код',
        null,
        [
          {
            text: 'Закрыть',
            onPress: () => { setLoading(false); },
            style: 'cancel',
          },
          {
            text: 'Проверить',
            onPress: (text) => {
              if (text === FREE_IAP) {
                window.IAP = PRODUCTS.map((productIdentifier) => ({ productIdentifier }));
                window.DB.insertSync({
                  table: 'iap',
                  values: PRODUCTS.map((productIdentifier) => ({ productIdentifier })),
                });
                Alert.alert('Воу воу!', 'Теперь у тебя есть все фишечки и плюшечки, молодец :)');
              } else {
                Alert.alert('Что-то пошло не так', 'Увы, но этот код не подходит');
              }
    
              setLoading(false);
            },
          },
        ],
        'secure-text',
      );
    },
    restorePayments: ({ setLoading }) => () => {
      setLoading(true);
      InAppUtils.restorePurchases((error, response) => {
        if (error) {
          Alert.alert('Ошибка соединения', 'Сейчас невозможно подключиться к iTunes, попробуйте позднее.');
        } else {
          if (response.length === 0) {
            Alert.alert('Хм...', 'А ничего и не было куплено еще');
            setLoading(false);
            return;
          }

          const filtered = response
            .map(({ 
              productIdentifier, 
              transactionReceipt,
              transactionIdentifier, 
              transactionDate,
            }) => ({ 
              productIdentifier, 
              transactionReceipt, 
              transactionIdentifier, 
              transactionDate,
            }));

          Alert.alert('Успешно', 'Мы восстановили все приобретенные покупки.');
          window.DB.insertSync({
            table: 'iap',
            values: filtered.filter(({ productIdentifier: newProduct }) => !window.IAP.find(({ productIdentifier }) => newProduct === productIdentifier)),
          });

          window.IAP = filtered.filter(({ productIdentifier: newProduct }) => !window.IAP.find(({ productIdentifier }) => newProduct === productIdentifier));
        }

        setLoading(false);
      });
    },
  }),
  lifecycle({
    componentDidMount() {
      const { setProducts, setLoading, getFree } = this.props;
      EventEmitter.on('iap_free', getFree);

      isNetworkConnected()
        .then((isConnected) => {
          if (isConnected) {
            InAppUtils
              .loadProducts(PRODUCTS, (error, products) => {
                setProducts(products);
                setLoading(false);
              });
          } else {
            return Promise.reject();
          }

          return Promise.resolve();
        }).catch(() => {
          setLoading(false);
          NoInternetConnection();
        });
    },
    componentWillUnmount() {
      EventEmitter.removeAllListeners('iap_free');
    },
  }),
)(Screen);