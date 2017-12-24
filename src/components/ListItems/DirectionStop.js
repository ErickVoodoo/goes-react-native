/* 
* Direction 
* @module Components 
* @flow  
*/

import React from 'react';
import { View, StyleSheet } from 'react-native';
import EventEmitter from 'react-native-eventemitter';
import Swipeable from 'react-native-swipeable';

import { ListItem, SwipeFavorite, NextTransport } from '../';
import { getTransportColor } from '../../utilities/parser'

import Colors from '../../constants/colors';

type IProps = {
  s_id: number,
  stop: string,
  p: string,
  type: string,
  nextPrev: Object,
  isfavorite: number, 
  onPress: Function,
};

export class DirectionStop extends React.Component {
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
    const { s_id, stop, p, type, nextPrev, isfavorite, onPress } = this.props;

    const rightButtons = [
      <SwipeFavorite
        isFavorite={isfavorite}
        onFavorite={(isFavorite) => this.onAddFavorite(isFavorite, s_id)}
      />,
    ];

    return (
      <Swipeable 
        rightButtons={rightButtons}
        onRef={ref => { this.swipeable = ref; }}
      >
        <View
          style={styles.container}
        >
          <View
            style={[ styles.item__type, { backgroundColor: getTransportColor(type) }]}
          />
          <ListItem
            subtitleStyle={!p ? { height: 0 } : {}}
            style={styles.listItem}
            title={stop}
            subtitle={p}
            badge={nextPrev ? { element: <NextTransport minutes={nextPrev.minutes} time={nextPrev.time} /> } : null}
            onPress={onPress}
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
  item__type: {
    width: 6,
    height: '100%',
    backgroundColor: Colors.busColor,
    marginTop: 1,
    marginBottom: 1,
  },
});