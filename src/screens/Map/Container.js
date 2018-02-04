/* 
* Container 
* @module Screen/Map 
* @flow  
*/

import { compose, lifecycle, withState, withHandlers } from 'recompose';
import { Alert } from 'react-native'

import { Screen } from './Screen';
import { MAP_RADIUSES, MAP_TYPES } from './constants';
import { SCREEN_IAP } from '../../constants/routes';
import { PRODUCTS } from '../Iap/constants';

let timer = null;

export const MapContainer = compose(
  withState('position', 'setPosition', {}),
  withState('stops', 'setStops', []),
  withState('searchedStops', 'setSearchedStops', null),
  withState('search', 'setSearch', ''),
  withState('mapType', 'setMapType', MAP_TYPES.standard),
  withState('radius', 'setRadius', MAP_RADIUSES[0]),
  withState('selectedMarker', 'setSelectedMarker', null),
  withState('followsUserLocation', 'setFollowsUserLocation', false),
  withHandlers({
    searchToCoordinates: ({ stops, setSearch, setSearchedStops, position }) => (search) => {
      setSearch(search);

      if (search.length >= 3) {
        const foundStops = stops
          .filter(({ n }) => n.toLowerCase().includes(search.toLowerCase()));

        setSearchedStops(foundStops);

        if (foundStops.length === 0) {
          foundStops.push({ lng: position.longitude, lat: position.latitude });
        }

        this.map.fitToCoordinates(
          foundStops.map(({ lat, lng }) => ({ latitude: Number(lat), longitude: Number(lng) })),
          {
            edgePadding: { top: 100, right: 80, bottom: 100, left: 80 },
            animated: true,
          },
        );
      } else {
        setSearchedStops(null);
      }
    },
    findMe: ({ setPosition }) => (relocate = false) => {
      // eslint-disable-next-line
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const position = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };

          setPosition(position);

          if (relocate && this.map) {
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

      timer = setInterval(() => {
        findMe(false);
      }, 10000);
    },
    componentWillUnmount() {
      // eslint-disable-next-line
      navigator.geolocation.clearWatch(this.watchID);
      clearInterval(timer);
    },
  }),
)(Screen);