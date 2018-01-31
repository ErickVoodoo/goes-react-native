/* 
* Container 
* @module Screen/Map 
* @flow  
*/

import { compose, lifecycle, withState, withHandlers } from 'recompose';
import { Alert } from 'react-native'

import { Screen } from './Screen';
import { MAP_RADIUSES, ZOOM_SHIFT } from './constants';
import { SCREEN_IAP } from '../../constants/routes';
import { PRODUCTS } from '../Iap/constants';

export const MapContainer = compose(
  withState('position', 'setPosition', {}),
  withState('stops', 'setStops', []),
  withState('search', 'setSearch', ''),
  withState('zoom', 'setZoom', { latitudeDelta: ZOOM_SHIFT * 5, longitudeDelta: ZOOM_SHIFT * 5 }),
  withState('radius', 'setRadius', MAP_RADIUSES[0]),
  withState('region', 'setRegion', null),
  withState('selectedMarker', 'setSelectedMarker', null),
  withHandlers({
    findMe: ({ setPosition, setZoom }) => (relocate = false) => {
      // eslint-disable-next-line
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const position = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };

          setPosition(position);
          setZoom({ longitudeDelta: ZOOM_SHIFT * 5, latitudeDelta: ZOOM_SHIFT * 5 });

          if (relocate) {
            this.map.animateToCoordinate(position, 500);
          }
        },
        ({ code }) => {
          if (code === 2 && window.IAP.find(({ productIdentifier }) => PRODUCTS[0] === productIdentifier)) {
            Alert.alert(
              'Ошибка', 
              'Необходимо включить геолокацию и разрешить отслеживать геопозицию в приложении. Это можно сделать из настроек телефона.',
              [
                { 
                  text: 'Закрыть', 
                  style: 'cancel',
                },
              ],
            );
          }
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
      );
    },
  }),
  lifecycle({
    componentWillMount() {
      const { setStops, navigation } = this.props;

      if (!window.IAP.find(({ productIdentifier }) => PRODUCTS[0] === productIdentifier)) {
        Alert.alert(
          'Информация',
          'Для использования данного функционала, пожалуйста, приобрети его',
          [
            { 
              text: 'Закрыть', 
            },
            { 
              text: 'К покупкам', 
              style: 'cancel',
              onPress: () => navigation.navigate(SCREEN_IAP),
            },
          ],
          { cancelable: true },
        );
        navigation.goBack();

        return;
      }

      window.DB.select({
        table: 'stops',
      })
        .then((stops) => {
          setStops(stops);
        });
    },
    componentDidMount() {
      const { setPosition, findMe } = this.props;

      // eslint-disable-next-line
      this.watchID = navigator.geolocation.watchPosition(({ coords }) => {
        setPosition({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      });

      findMe();
    },
    componentWillUnmount() {
      // eslint-disable-next-line
      navigator.geolocation.clearWatch(this.watchID);
    },
  }),
)(Screen);