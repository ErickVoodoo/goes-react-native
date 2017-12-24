/* 
* Direction 
* @module Components 
* @flow  
*/

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EventEmitter from 'react-native-eventemitter';
import Swipeable from 'react-native-swipeable';

import { ListItem, TransportIcon, SwipeFavorite } from '../';

import Colors from '../../constants/colors';

type IProps = {
  block: Array<*>;
  onNavigateToDirection: Function;
};

export class Direction extends React.Component {
  props: IProps;

  state = {
    firstSelect: true,
  };

  // componentDidMount = () => {
  //   EventEmitter.on('change__favorite', () => {
  //     this.swipeable.recenter();
  //   });
  // }

  onAddFavorite = (isFavorite, id) => {
    this.swipeable.recenter();
    
    setTimeout(() => {
      window.DB.update({
        table: 'directions',
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
    const { block, onNavigateToDirection } = this.props;

    const { firstSelect } = this.state;
    const { key, id, name, transport, type, isfavorite } = block[firstSelect ? 0 : 1];
    const x = block;

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
            key={key}
            title={name}
            leftIcon={<TransportIcon number={transport} type={type} />}
            onPress={onNavigateToDirection(firstSelect ? block : x.slice().reverse())}
            rightIcon={<FontAwesome name='exchange' size={1} />}
            style={styles.listItem}
          />
          {
            block.length === 2 && block[1] &&
              <TouchableOpacity
                style={styles.opacity}
                activeOpacity={0.2}
                onPress={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (block.length === 2 && block[1]) {
                    this.setState({
                      firstSelect: !firstSelect,
                    });
                  }
                }}
              >
                <FontAwesome name='exchange' size={20} color={Colors.darkGray} />
              </TouchableOpacity>
          }
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