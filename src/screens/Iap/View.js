/* 
* Splash 
* @module Sreens 
* @flow  
*/

import React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, Button, ScrollView, ActivityIndicator } from 'react-native';

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
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const Item = ({ icon, title, description, price, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.6} style={{ paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#f6f6f6' }}>
    <Flex row style={{ width: '100%' }}>
      <Flex column align={'center'} justify={'center'} style={styles.item_icon}>
        <LinearGradient
          style={styles.item__gradient}
          colors={['#63E2FF', '#B066FE']}
          start={{ x: 0, y: 0.1 }} 
          end={{ x: 0.1, y: 1 }}
        />
        <FontAwesome name={icon} size={28} color={'#fff'} style={{ backgroundColor: 'transparent' }}/>
      </Flex>
      <Flex column size={1} style={{ marginHorizontal: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{title}</Text>
        <Text style={{ fontSize: 12, color: '#a6a6a6' }}>{description}</Text>
      </Flex>
      <Flex column align={'center'} justify={'center'} style={{ width: 'auto', paddingHorizontal: 4 }}>
        <Text style={styles.price}>{price}</Text>
      </Flex>
    </Flex>
  </TouchableOpacity>
);

export const Screen = ({ restorePayments, buyProduct, isLoading, products }) => (
  <ScrollView style={{ flex: 1 }}>
    <Button 
      title={'Восстановить покупки'}
      onPress={restorePayments}
    />
    { isLoading ?
      <ActivityIndicator style={{ flex: 1, height: '100%' }} /> :
      <Flex column align={'flex-start'} justify={'flex-start'} style={styles.container}>
        {products.map(({ title, description, priceString, identifier }) => (
          <Item 
            onPress={() => buyProduct(identifier)}
            icon={MARKET_ITEMS.find(({ identifier: v }) => v === identifier).icon}
            title={title}
            description={description}
            price={priceString}
          />
        ))}
      </Flex>
    }
  </ScrollView>
);