/* 
* Screen 
* @module Screens/Map 
* @flow  
*/  

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import styled from 'styled-components/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SearchBar } from 'react-native-elements';
import { Flex } from '../../components';
import { SETTINGS_KEYS, GOOGLE_API_KEY } from '../../constants/config'
import { distanceBetweenTwoPoints } from '../../utilities/common';
import { MAP_RADIUSES, ZOOM_SHIFT } from './constants';

import { CallOut } from './Callout';

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

const SuggestionPlace = styled.View`
  padding: 4px;
  padding-left: 8px;
`;

export const Screen = ({ 
  navigation, 
  stops, 
  position, 
  findMe, 
  search, 
  setSearch, 
  zoom, 
  setZoom, 
  setPosition, 
  radius, 
  setRadius, 
  region, 
  setRegion,
  selectedMarker,
  setSelectedMarker,
}: IProps) => (
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
            `Найдено ${stops.filter(({ n }) => n.toLowerCase().includes(search.toLowerCase())).length} совпадений` :
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
        onPress={() => {
          setSelectedMarker(null);
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
          .map(({ lat, lng, ...item }) => ({ distance: distanceBetweenTwoPoints(position, { latitude: lat, longitude: lng }), lat, lng, ...item }))
          .filter(({ distance }) => search.length >= 3 || distance < radius)
          .map((marker, index) => {
            let isCalloutedMarker = false;

            if (selectedMarker) {
              const { lat, lng } = selectedMarker;
              if (lat === marker.lat && lng === marker.lng) {
                isCalloutedMarker = true;
              }
            }

            return (
              <MapView.Marker
                // eslint-disable-next-line
                key={index}
                coordinate={{
                  latitude: Number(marker.lat), 
                  longitude: Number(marker.lng),
                }}
                pinColor={isCalloutedMarker ? 'rgb(104, 187, 145)' : window.SETTINGS[SETTINGS_KEYS[0]]}
                onPress={() => {
                  setTimeout(() => {
                    setSelectedMarker(marker);
                  }, 0);
                }}
              />
            );
          },
        )}
        {selectedMarker &&
          <MapViewDirections
            origin={position}
            destination={{ latitude: parseFloat(selectedMarker.lat), longitude: parseFloat(selectedMarker.lng) }}
            apikey={GOOGLE_API_KEY}
            mode={'walking'}
            strokeWidth={3}
            strokeColor={window.SETTINGS[SETTINGS_KEYS[0]]}
          />
        } 
      </MapView>
    }
    {!!Object.keys(position).length &&
      <CallOut 
        isHidden={!selectedMarker}
        map={this.map}
        navigation={navigation}
        {...selectedMarker}
        distance={selectedMarker ? distanceBetweenTwoPoints(position, { latitude: selectedMarker.lat, longitude: selectedMarker.lng }) : 0}
      />
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