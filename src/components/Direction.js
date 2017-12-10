/* 
* Direction 
* @module Components 
* @flow  
*/

import React from 'react';
import { View, TouchableOpacity, ActionSheetIOS } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EventEmitter from 'react-native-eventemitter';

import { ListItem, TransportIcon } from './';

import Colors from '../constants/colors';

type IProps = {
  block: Array<*>;
  onNavigateToDirection: Function;
};

const FAVORITE = [
  'Сохранить',
  'Закрыть',
];

const UNFAVORITE = [
  'Удалить',
  'Закрыть',
];

export class Direction extends React.Component {
  props: IProps;

  state = {
    firstSelect: true,
  }

  render() {
    const { block, onNavigateToDirection } = this.props;
    const { firstSelect } = this.state;
    const { key, name, transport, type } = block[firstSelect ? 0 : 1];
    const x = block;

    return (
      <View style={{ display: 'flex', flexDirection: 'row', width: '100%', borderBottomColor: Colors.lightGrayColor, borderBottomWidth: 1, height: 52 }}>
        <ListItem
          key={key}
          title={name}
          leftIcon={<TransportIcon number={transport} type={type} />}
          onPress={onNavigateToDirection(firstSelect ? block : x.slice().reverse())}
          rightIcon={<FontAwesome name='exchange' size={1} />}
          style={{ height: 52, maxHeight: 52, flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}
          onLongPress={() => {
            const { block } = this.props;
            const { firstSelect } = this.state;

            const { id, isfavorite } = block[firstSelect ? 0 : 1];

            ActionSheetIOS.showActionSheetWithOptions({
              options: isfavorite ? UNFAVORITE : FAVORITE,
              cancelButtonIndex: 1,
              destructiveButtonIndex: isfavorite ? 0 : 10,
            },
              (buttonIndex) => {
                const { block } = this.props;
                const { firstSelect } = this.state;

                const { id, isfavorite } = block[firstSelect ? 0 : 1];

                if (buttonIndex === 0) {
                  window.DB.update({
                    table: 'directions',
                    values: {
                      isfavorite: isfavorite ? 0 : 1,
                    },
                    where: {
                      id,
                    },
                  })
                    .then(() => {
                      EventEmitter.emit('change__favorite__directions');
                    });
                }
              },
            );
          }}
        />
        {
          block.length === 2 && block[1] ?
            <TouchableOpacity
              style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
            </TouchableOpacity> :
            null
        }
      </View>
    );
  }
}
