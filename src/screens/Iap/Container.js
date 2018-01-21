/* 
* Container 
* @module Screens/Splash 
* @flow  
*/

import { compose, lifecycle, withState, withHandlers } from 'recompose';
import { NativeModules, Alert } from 'react-native'
import { Screen } from './View';
import { PRODUCTS } from './constants';

const { InAppUtils } = NativeModules;

export const IapContainer = compose(
  withState('isLoading', 'setLoading', true),
  withState('products', 'setProducts', []),
  withHandlers({
    buyProduct: ({ setLoading }) => identifier => {
      setLoading(true);
      InAppUtils.canMakePayments((canMakePayments) => {
        if (!canMakePayments) {
          Alert.alert('Ошибка.', 'На устройстве нет разрешения на покупку.');
        } else {
          InAppUtils.purchaseProduct(identifier, (error, response) => {
            setLoading(false);
            if (response && response.productIdentifier) {
              Alert.alert('Успешно приобретено!');
            }

            alert(JSON.stringify(error), JSON.stringify(response));
          });
        }
      });
    },
    restorePayments: () => () => {
      InAppUtils.restorePurchases((error, response) => {
        if (error) {
          Alert.alert('Ошибка соединения', 'Сейчас невозможно подключиться к iTunes, попробуйте позднее.');
        } else {
          if (response.length === 0) {
            Alert.alert('Хм...', 'А ничего и не было куплено еще');
            return;
          } else {
            Alert.alert('Успешно', 'Мы восстановили все приобретенные покупки.');
          }
     
          response.forEach((purchase) => {
            if (purchase.productIdentifier === PRODUCTS[0]) {
              // TODO: Save to db that user has been purchased this item already
            }
          });
        }
      });
    },
  }),
  lifecycle({
    componentDidMount() {
      const { setProducts, setLoading } = this.props;

      InAppUtils
        .loadProducts(PRODUCTS, (error, products) => {
          alert(products.length)
          alert(error)
          setProducts(products);
          setLoading(false);
        });
    },
  }),
)(Screen);