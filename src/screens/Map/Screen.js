/* 
* Screen 
* @module Screens/Map 
* @flow  
*/  

import React from 'react';
import { View, StyleSheet, Button, Text, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import styled from 'styled-components/native';
import { prop } from 'styled-tools';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { isNil } from 'lodash';
import { SearchBar } from 'react-native-elements';
import { Flex } from '../../components';
import { SETTINGS_KEYS } from '../../constants/config'
import { SCREEN_STOP_DIRECTIONS } from '../../constants/routes';
import { distanceBetweenTwoPoints } from '../../utilities/common';
import { getTransportColor } from '../../utilities/parser';
import { MAP_RADIUSES, ZOOM_SHIFT } from './constants';

type IProps = {
  stops: Array<Object>,
  position: Object,
  findMe: Function,
}

const ButtonsPanel = styled(Flex)`
  position: absolute;
  bottom: 24px;
`;

const WhiteButton = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 24px;
  border: 1px solid #d6d6d6;
  background: white;
  height: 48px;
  width: 48px;
`;

const TransportType = styled.View`
  width: 4px;
  background-color: ${prop('color')};
  flex: 1;
`;

const TrasnportPanel = styled(Flex)`
  height: 100%; 
  width: 4px; 
  margin-right: 8px;
`;

class Callout extends React.Component {
  state = {
    types: [],
    isLoading: true,
  }

  componentDidMount = async () => {
    const { id } = this.props;

    window.DB.query({
      sql: `
        SELECT times.pos pos, times.tms tms, directions.name direction, directions.id d_id, routes.type type, routes.name as transport, routes.id as r_id, directions.isfavorite isfavorite
        FROM times
        LEFT JOIN directions
        ON times.d_id=directions.id
        AND times.id_s=${id}
        LEFT JOIN routes
        ON directions.r_id=routes.id
        GROUP BY directions.id`,
    })
      .then((items) => {
        this.setState({
          types: items.map(({ type }) => type).filter((type, index, arr) => !isNil(type) && arr.indexOf(type) === index).sort(),
          isLoading: false,
        });
      });
  }

  props: {
    navigation: Object,
    id: number | string,
    n: string,
    p: string,
  };

  render = () => {
    const { navigation, id, n, p } = this.props;
    const { types } = this.state;

    return (
      <Flex row style={{ zIndex: 1000, backgroundColor: '#fff' }}>
        <TrasnportPanel column>
          {types.includes(0) &&
            <TransportType color={getTransportColor(0)} />
          }
          {types.includes(1) &&
            <TransportType color={getTransportColor(1)} />
          }
          {types.includes(2) &&
            <TransportType color={getTransportColor(2)} />
          }
          {types.includes(3) &&
            <TransportType color={getTransportColor(3)} />
          }
        </TrasnportPanel>
        <Flex column size={1}>
          <Text style={{ borderBottomColor: '#e6e6e6', borderBottomWidth: 1, width: '100%' }}>Остановка:</Text>
          <Text style={{ fontWeight: 'bold', maxWidth: 300 }}>{n}</Text>
          <Text style={{ fontSize: 12, fontStyle: 'italic' }}>{p}</Text>
          <Button 
            onPress={() => navigation.navigate(SCREEN_STOP_DIRECTIONS, { s_id: id, title: n, p })}
            title={'К расписанию'}
          />
        </Flex>
      </Flex>
    );
  }
};

const SuggestionPlace = styled.View`
  padding: 4px;
  padding-left: 8px;
`;

export const Screen = ({ navigation, stops, position, findMe, search, setSearch, toMinsk, zoom, setZoom, setPosition, radius, setRadius, region, setRegion }: IProps) => (
  <View style={styles.container}>
    <SearchBar
      round
      lightTheme
      autoComplete={false}
      autoCorrect={false}
      placeholder='Найти остановку'
      containerStyle={styles.search}
      clearButtonMode='always'
      onChangeText={setSearch}
      inputStyle={{
        backgroundColor: '#fff',
      }}
    />
    <SuggestionPlace>
      <Text>
        { search.length >= 3 ?
            `Найдено ${stops.filter(({ n }) => n.toLowerCase().includes(search.toLowerCase())).length} совпадений`:
            `Для поиска необходимо минимум ${3 - search.length} символ${search.length === 2 ? '' : 'а'}` 
        }
      </Text>
    </SuggestionPlace>
    { !!Object.keys(position).length &&
      <MapView
        style={styles.map}
        region={{
          ...(region || position),
          ...zoom,
        }}
        ref={map => { this.map = map; }}
        onRegionChangeComplete={({ latitude, longitude, longitudeDelta, latitudeDelta }) => {
          setZoom({
            longitudeDelta,
            latitudeDelta,
          });

          setRegion({
            latitude,
            longitude,
          });
        }}
      >
        {!(search.length > 3) && 
          <MapView.Circle 
            key={(position.longitude + position.latitude + radius).toString()}
            center={position}
            radius={radius}
            fillColor={'rgba(255, 0, 0, 0.1)'}
            strokeColor={'rgba(255, 0, 0, 0.5)'}
          />
        }
        <MapView.Marker.Animated 
          coordinate={position} 
        />
        {stops
          .filter(({ n }) => n.toLowerCase().includes(search.toLowerCase()))
          .filter(({ lat, lng }) => search.length >= 3 || distanceBetweenTwoPoints(position, { latitude: lat, longitude: lng }) < radius)
          .map((marker, index) => (
            <MapView.Marker
              // eslint-disable-next-line
              key={index}
              coordinate={{
                latitude: Number(marker.lat), 
                longitude: Number(marker.lng),
              }}
              title={marker.n}
              description={marker.p}
              pinColor={window.SETTINGS[SETTINGS_KEYS[0]]}
              onPress={() => {
                this.map.animateToCoordinate({
                  latitude: Number(marker.lat), 
                  longitude: Number(marker.lng) + 0.0001,
                }, 100);
              }}
            >
              <MapView.Callout>
                <Callout {...marker} navigation={navigation} />
              </MapView.Callout>
            </MapView.Marker>
        ))}
      </MapView>
    }
    <ButtonsPanel
      row
      align={'center'}
      justify={'space-around'}
      style={{
        width: '70%',
        left: 24,
        right: 0,
      }}
    >
      {MAP_RADIUSES.map((rad) => (
        <TouchableOpacity
          key={rad}
          activeOpacity={0.9}
          onPress={() => setRadius(rad)}
        >
          <WhiteButton selected={rad === radius}>
            <Text style={{ color: rad === radius ? window.SETTINGS[SETTINGS_KEYS[0]] : 'black' }}>{rad / 1000}км</Text>
          </WhiteButton>
        </TouchableOpacity>
      ))}
    </ButtonsPanel>
    <ButtonsPanel
      column
      style={{
        width: 48,
        right: 24,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => findMe(true)}
        style={{
          marginBottom: 16,
        }}
      >
        <WhiteButton>
          <FontAwesome name='location-arrow' size={24} color={window.SETTINGS[SETTINGS_KEYS[0]]} />
        </WhiteButton>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => 
          setZoom({
            latitudeDelta: zoom.latitudeDelta - ZOOM_SHIFT <= 0 ? zoom.latitudeDelta : zoom.latitudeDelta - ZOOM_SHIFT,
            longitudeDelta: zoom.longitudeDelta - ZOOM_SHIFT <= 0 ? zoom.longitudeDelta : zoom.longitudeDelta - ZOOM_SHIFT,
          })
        }
        style={{
          marginBottom: 16,
        }}
      >
        <WhiteButton>
          <FontAwesome name='plus' size={24} color={window.SETTINGS[SETTINGS_KEYS[0]]} />
        </WhiteButton>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => 
          setZoom({
            latitudeDelta: zoom.latitudeDelta + ZOOM_SHIFT,
            longitudeDelta: zoom.longitudeDelta + ZOOM_SHIFT,
          })
        }
      >
        <WhiteButton>
          <FontAwesome name='minus' size={24} color={window.SETTINGS[SETTINGS_KEYS[0]]} />
        </WhiteButton>
      </TouchableOpacity>
    </ButtonsPanel>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
});