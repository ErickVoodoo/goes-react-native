/* 
* SwipableFlatList 
* @module  
* @flow  
*/

import React from 'react';
import EventEmitter from 'react-native-eventemitter';
import { StyleSheet } from 'react-native';
import SwipeList from 'react-native-smooth-swipe-list';
import { SwipeFavorite } from './';

export const SwipableFlatList = ({ table, rowData, style = {} }) => {
  const styles = StyleSheet.flatten([{
    backgroundColor: '#fff',
  }, style]);

  return (
    <SwipeList 
      rowData={rowData.map(({ isfavorite, id, ...item }) => ({
        ...item,
        id,
        rightSubView: <SwipeFavorite
          isFavorite={isfavorite}
          onFavorite={(isFavorite) => {
            setTimeout(() => {
              window.DB.update({
                table,
                values: {
                  isfavorite: isFavorite,
                },
                where: {
                  id,
                },
              })
                .then(() => {
                  EventEmitter.emit('change__favorite');
                });
            }, 200);
          }}
        />,
      }))}
      style={styles}
    />
  );
};