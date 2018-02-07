/* 
* Screen 
* @module Screens/Map 
* @flow  
*/  

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import hexToRgba from 'hex-rgba';
import MapViewDirections from 'react-native-maps-directions';
import styled from 'styled-components/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SearchBar } from 'react-native-elements';
import { Flex } from '../../components';
import { SETTINGS_KEYS, GOOGLE_API_KEY } from '../../constants/config'
import { distanceBetweenTwoPoints } from '../../utilities/common';
import { MAP_RADIUSES, ZOOM_SHIFT, MAP_TYPES } from './constants';

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

let searchRef = null;

export const Screen = ({ 
  navigation, 
  stops, 
  position, 
  findMe, 
  search, 
  searchedStops,
  searchToCoordinates,
  setPosition, 
  radius, 
  setRadius, 
  selectedMarker,
  setSelectedMarker,
  mapType,
  setMapType,
  followsUserLocation,
  setFollowsUserLocation,
}: IProps) => (
  <View style={styles.container}>
    <SearchBar
      round
      lightTheme
      ref={v => { searchRef = v; }}
      autoComplete={false}
      autoCorrect={false}
      placeholder='Найти остановку (от 3 символов)'
      containerStyle={styles.search}
      clearButtonMode='always'
      onChangeText={searchToCoordinates}
      inputStyle={{
        backgroundColor: '#fff',
      }}
    />
    { Object.keys(position).length ?
      <MapView
        mapType={mapType}
        followsUserLocation={followsUserLocation}
        showsUserLocation
        userLocationAnnotationTitle={'Моя позиция'}
        showsMyLocationButton
        showsScale
        showsCompass
        style={styles.map}
        initialRegion={{
          ...position,
          ...{
            latitudeDelta: ZOOM_SHIFT,
            longitudeDelta: ZOOM_SHIFT,
          },
        }}
        ref={map => { this.map = map; }}
        onPress={() => {
          searchRef.blur();
          setSelectedMarker(null);
        }}
      >
        {!(search.length > 3) && 
          <MapView.Circle 
            key={(position.longitude + position.latitude + radius).toString()}
            center={position}
            radius={radius}
            fillColor={hexToRgba(window.SETTINGS[SETTINGS_KEYS[0]], 15)}
            strokeColor={hexToRgba(window.SETTINGS[SETTINGS_KEYS[0]], 70)}
          />
        }
        {(searchedStops ||
              stops
                .map(({ lat, lng, ...item }) => ({ distance: distanceBetweenTwoPoints(position, { latitude: lat, longitude: lng }), lat, lng, ...item }))
                .filter(({ distance }) => distance < radius)
          )
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
                  if (Number(marker.lat) !== Number(position.latitude) && Number(marker.lng) !== Number(position.longitude)) {
                    setTimeout(() => {
                      setSelectedMarker(marker);
                    }, 0);
                  }
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
      </MapView> :
      <Flex size={1} />
    }
    <CallOut 
      isHidden={!selectedMarker}
      map={this.map}
      navigation={navigation}
      {...selectedMarker}
      distance={selectedMarker ? distanceBetweenTwoPoints(position, { latitude: selectedMarker.lat, longitude: selectedMarker.lng }) : 0}
    />
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
        onPress={() => setMapType(MAP_TYPES.standard)}
        style={{
          marginBottom: 16,
        }}
      >
        <WhiteButton>
          <FontAwesome name='map' size={20} color={mapType === MAP_TYPES.standard ? window.SETTINGS[SETTINGS_KEYS[0]] : '#e6e6e6'} />
        </WhiteButton>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setMapType(MAP_TYPES.hybrid)}
      >
        <WhiteButton>
          <FontAwesome name='globe' size={20} color={mapType === MAP_TYPES.hybrid ? window.SETTINGS[SETTINGS_KEYS[0]] : '#e6e6e6'} />
        </WhiteButton>
      </TouchableOpacity>
    </ButtonsPanel>
    <ButtonsPanel
      row
      style={{
        right: 24,
        width: 48,
        top: 72,
        height: 48,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setFollowsUserLocation(!followsUserLocation)}
      >
        <WhiteButton>
          <FontAwesome name='street-view' size={20} color={followsUserLocation ? window.SETTINGS[SETTINGS_KEYS[0]] : '#e6e6e6'} />
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