/* 
* Splash 
* @module Sreens 
* @flow  
*/

import React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import Gallery from 'react-native-image-gallery';
import noun from 'plural-ru';

import { SETTINGS_KEYS } from '../../constants/config';
import { Flex } from '../../components/';
import { MARKET_ITEMS, INFO } from './constants';

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

const Panel = ({ imagesCount, description, onClose }) => (
  <Flex column style={{ zIndex: 1, position: 'absolute', width: '100%', opacity: 0.8, top: 0, paddingTop: 20, backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]] }}>
    {description && <Text style={{ fontSize: 14, color: '#fff', padding: 8 }}>{description}</Text>}
    <Flex row align={'center'} justify={'space-between'} style={{ padding: 8, paddingVertical: 4 }}>
      <Text style={{ fontSize: 20, color: '#fff' }}>{`${imagesCount} ${noun(imagesCount, 'скриншот', 'скриншота', 'скриншотов')}`}</Text>
      <TouchableOpacity style={{ height: 50, width: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }} activeOpacity={0.6} onPress={() => onClose(null)}>
        <FontAwesome name={'times'} size={28} color={'#fff'} style={{ backgroundColor: 'transparent' }} />
      </TouchableOpacity>
    </Flex>
  </Flex>
);

const ImageViewer = ({ visible, onClose }) => {
  const selected = visible ? INFO.find(({ identifier }) => identifier === visible) : { images: [] };

  return (
    <Modal
      visible={!!visible}
      animationType={'slide'}
      onRequestClose={() => onClose(null)}
    >
      <Gallery
        style={{ flex: 1, backgroundColor: 'white' }}
        images={selected.images.map(image => ({ source: image }))}
      />
      <Panel 
        imagesCount={selected.images.length}    
        description={selected.description}
        onClose={onClose} 
      />
    </Modal>
  );
}

const Item = ({ icon, title, description, priceString, price, onPress, onInfo, disabled = false }) => (
  <Flex column style={{ paddingLeft: 8, marginTop: 4, backgroundColor: '#f6f6f6' }}>
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
      <Flex column style={{ width: 80, paddingHorizontal: 4 }}>
        <TouchableOpacity activeOpacity={0.6} style={{ flex: 1, flexShrink: 0 }} onPress={onInfo}>
          <Flex column align={'center'} size={1} justify={'center'} style={{ backgroundColor: 'rgb(76, 195, 256)' }}>
            <FontAwesome name={'info'} size={22} color={'#fff'} style={{ backgroundColor: 'transparent' }} />
            <Text style={{ fontSize: 12, color: '#fff' }}>Инфо</Text>
          </Flex>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.6} style={{ flex: 1, flexShrink: 0 }} onPress={disabled ? null : onPress}>
          <Flex column align={'center'} size={1} justify={'center'} style={{ width: '100%', backgroundColor: disabled ? 'transparent' : 'rgb(164, 194, 107)' }}>
            { disabled ?
              <FontAwesome name={'check'} size={28} color={'rgb(164, 194, 107)'} style={{ backgroundColor: 'transparent' }} /> :
              <Text style={styles.price}>{!price ? 'Free' : priceString}</Text>
            }
            <Text style={{ fontSize: disabled ? 12 : 14, letterSpacing: disabled ? 0 : 1, color: disabled ? '#a6a6a6' : '#fff' }}>{disabled ? 'Куплено' : 'Купить'}</Text>
          </Flex>
        </TouchableOpacity>
      </Flex> 
    </Flex>
  </Flex>
);

export const Screen = ({ restorePayments, buyProduct, isLoading, products, exampleId, setExampleId }) => (
  isLoading ?
    <ActivityIndicator style={{ flex: 1, height: '100%', backgroundColor: '#fff' }} /> :
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Flex column align={'flex-start'} justify={'flex-start'} style={styles.container}>
      
        {products.sort((a, b) => window.NaturalSort(a.price, b.price)).map(({ title, description, priceString, price, identifier }) => {
          const { icon, analytic, title: sTitle, description: sDescription } = MARKET_ITEMS.find(({ identifier: v }) => v === identifier);

          return (<Item 
            key={identifier}
            onPress={() => { buyProduct(identifier); window.ANALYTIC.event(analytic.buy); }}
            onInfo={() => { setExampleId(identifier); window.ANALYTIC.event(analytic.info); }}
            icon={icon}
            title={title || sTitle}
            description={description || sDescription}
            priceString={priceString}
            price={price}
            disabled={window.IAP.find(({ productIdentifier }) => identifier === productIdentifier)}
          />);
        })}
      </Flex>
      <TouchableOpacity onPress={restorePayments} activeOpacity={0.6} style={{ paddingVertical: 16, paddingHorizontal: 8 }}>
        <Flex column align={'center'} justify={'center'}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: window.SETTINGS[SETTINGS_KEYS[0]] }}>
            Восстановить мои покупки
          </Text>
          <FontAwesome name={'refresh'} size={22} color={window.SETTINGS[SETTINGS_KEYS[0]]} style={{ backgroundColor: 'transparent' }} />
        </Flex>
      </TouchableOpacity>
      <ImageViewer 
        visible={exampleId}
        onClose={setExampleId}
      />
    </ScrollView>
);