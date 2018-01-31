/* 
* Splash 
* @module Sreens 
* @flow  
*/

import React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';

import { SETTINGS_KEYS } from '../../constants/config';
import { Flex } from '../../components/';
import { MARKET_ITEMS } from './constants';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    position: 'relative',
  },
  item__gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    borderRadius: 4,
  },
  item_icon: {
    height: 90,
    width: 90, 
    position: 'relative',
    marginVertical: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

const Item = ({ icon, title, description, priceString, price, onPress, disabled = false }) => (
  <TouchableOpacity onPress={disabled ? null : onPress} activeOpacity={0.6} style={{ paddingLeft: 8, marginTop: 4, backgroundColor: '#f6f6f6' }}>
    <Flex row style={{ width: '100%' }}>
      <Flex column align={'center'} justify={'center'} style={styles.item_icon}>
        <LinearGradient
          style={styles.item__gradient}
          colors={['#63E2FF', '#B066FE']}
          start={{ x: 0, y: 0.1 }} 
          end={{ x: 0.1, y: 1 }}
        />
        <FontAwesome name={icon} size={28} color={'#fff'} style={{ backgroundColor: 'transparent' }} />
      </Flex>
      <Flex column size={1} style={{ marginHorizontal: 8, paddingVertical: 4 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{title}</Text>
        <Text style={{ fontSize: 12, color: '#a6a6a6' }}>{description}</Text>
      </Flex>
      <Flex column align={'center'} justify={'center'} style={{ width: 80, paddingHorizontal: 4, backgroundColor: disabled ? 'transparent' : 'rgb(164, 194, 107)' }}>
        { disabled ?
          <FontAwesome name={'check'} size={28} color={'rgb(164, 194, 107)'} style={{ backgroundColor: 'transparent' }} /> :
          <Text style={styles.price}>{!price ? 'Free' : priceString}</Text>
        }
        <Text style={{ fontSize: disabled ? 12 : 14, letterSpacing: disabled ? 0 : 1, color: disabled ? '#a6a6a6' : '#fff' }}>{disabled ? 'Куплено' : 'Купить'}</Text>
      </Flex>
    </Flex>
  </TouchableOpacity>
);

export const Screen = ({ restorePayments, buyProduct, isLoading, products }) => (
  isLoading ?
    <ActivityIndicator style={{ flex: 1, height: '100%', backgroundColor: '#fff' }} /> :
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Flex column align={'flex-start'} justify={'flex-start'} style={styles.container}>
        {products.sort((a, b) => window.NaturalSort(a.price, b.price)).map(({ title, description, priceString, price, identifier }) => (
          <Item 
            key={title}
            onPress={() => buyProduct(identifier)}
            icon={MARKET_ITEMS.find(({ identifier: v }) => v === identifier).icon}
            title={title}
            description={description}
            priceString={priceString}
            price={price}
            disabled={window.IAP.find(({ productIdentifier }) => identifier === productIdentifier)}
          />
        ))}
      </Flex>
      <TouchableOpacity onPress={restorePayments} activeOpacity={0.6} style={{ paddingVertical: 16, paddingHorizontal: 8 }}>
        <Flex column align={'center'} justify={'center'}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: window.SETTINGS[SETTINGS_KEYS[0]] }}>
            Восстановить мои покупки
          </Text>
          <FontAwesome name={'refresh'} size={22} color={window.SETTINGS[SETTINGS_KEYS[0]]} style={{ backgroundColor: 'transparent' }} />
        </Flex>
      </TouchableOpacity>
    </ScrollView>
);