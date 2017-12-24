/* 
* Direction 
* @module Components 
* @flow  
*/

import React from 'react';
import { View, StyleSheet } from 'react-native';
import EventEmitter from 'react-native-eventemitter';
import Swipeable from 'react-native-swipeable';

import { ListItem, SwipeFavorite } from '../';

import Colors from '../../constants/colors';

type IProps = {
  id: number,
  p: string,
  n: string,
  isfavorite: number, 
  onPress: Function,
};

export class Stop extends React.Component {
  props: IProps;

  // componentDidMount = () => {
  //   EventEmitter.on('change__favorite', () => {
  //     this.swipeable.recenter();
  //   });
  // }

  onAddFavorite = (isFavorite, id) => {
    this.swipeable.recenter();
    
    setTimeout(() => {
      window.DB.update({
        table: 'stops',
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
  }

  render() {
    const { id, p, n, isfavorite, onPress } = this.props;

    const rightButtons = [
      <SwipeFavorite
        isFavorite={isfavorite}
        onFavorite={(isFavorite) => this.onAddFavorite(isFavorite, id)}
      />,
    ];

    return (
      <Swipeable 
        rightButtons={rightButtons}
        onRef={ref => { this.swipeable = ref; }}
      >
        <View style={styles.container}>
          <ListItem
            title={n}
            subtitle={p}
            onPress={onPress}
            style={styles.listItem}
          />
        </View>
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row', 
    alignItems: 'center',
    width: '100%', 
    borderBottomColor: Colors.lightGrayColor, 
    borderBottomWidth: 1, 
    height: 52, 
    backgroundColor: '#fff',
  },
  listItem: {
    height: 52, 
    maxHeight: 52, 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-start',
  },
  opacity: { 
    width: 40, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
});