/* 
* Container 
* @module Screen/Map 
* @flow  
*/

import { compose, lifecycle, withState, withHandlers } from 'recompose';

import { Screen } from './Screen';
import { CITIES } from '../../constants/config';

import { MAP_RADIUSES, ZOOM_SHIFT } from './constants';

export const MapContainer = compose(
  withState('position', 'setPosition', { }),
  withState('stops', 'setStops', []),
  withState('search', 'setSearch', ''),
  withState('zoom', 'setZoom', { latitudeDelta: ZOOM_SHIFT * 5, longitudeDelta: ZOOM_SHIFT * 5 }),
  withState('radius', 'setRadius', MAP_RADIUSES[0]),
  withState('region', 'setRegion', null),
  withHandlers({
    toMinsk: ({ setPosition }) => () => {
      setPosition(CITIES[4].position);
      this.map.animateToCoordinate(CITIES[4].position, 100);
    },
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
            this.map.animateToCoordinate(position, 100);
          }
        },
        (error) => {
          alert(JSON.stringify(error));
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
      );
    },
  }),
  lifecycle({
    componentWillMount() {
      const { setStops } = this.props;

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