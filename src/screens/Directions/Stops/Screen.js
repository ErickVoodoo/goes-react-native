/* 
* Scene 
* @module Screens/Directions 
* @flow  
*/

import React from 'react';
import { View, StyleSheet, ListView } from 'react-native';
import { ListItem, List } from 'react-native-elements';
import { isNil } from 'lodash';
import { Actions } from 'react-native-router-flux';
import EventEmitter from 'react-native-eventemitter';
import { SwipeListView } from 'react-native-swipe-list-view';

import { NextTransport, Loader, SwipeFavorite } from '../../../components';
import { getNextTime, makeTimeToReadableFormat } from '../../../utilities/time';
import { getTransportColor } from '../../../utilities/parser'
import Colors from '../../../constants/colors';

import { SCREEN_SCHEDULE } from '../../../constants/routes';

type IProps = {
  currentDirection: Object,
  reverseDirection: Object,
}

export class Screen extends React.Component {
  props: IProps;

  state = {
    items: [],
    currentIdDirection: null,
    isLoading: true,
  }

  componentWillMount = () => {
    this.timer = setInterval(() => {
      this.forceUpdate();
    }, 5000);

    EventEmitter.on('change__direction', this.changeDirection);
    EventEmitter.on('change__favorite', () => {
      const { currentDirection: { id: c_id, r_id: c_r_id }, reverseDirection } = this.props;

      if (reverseDirection) {
        const { id: r_id, r_id: r_r_id } = reverseDirection;
        const isCurrent = this.state.currentIdDirection === c_id;

        this.getSchedule(isCurrent ? c_id : r_id, isCurrent ? c_r_id : r_r_id, true);
      } else {
        this.getSchedule(c_id, c_r_id, true);
      }
    });

    window.ANALYTIC.page(window.ANALYTIC_PAGES.DIRECTIONS_ITEMS);
  }

  componentDidMount = () => {
    const { currentDirection: { id, r_id } } = this.props;
    setTimeout(() => {
      this.getSchedule(id, r_id);
    }, 500);
  }

  timer = null;

  componentWillUnmount = () => {
    clearInterval(this.timer);
    EventEmitter.removeAllListeners('change__favorite');
    EventEmitter.removeAllListeners('change__direction');
  }

  changeDirection = () => {
    const { currentDirection, reverseDirection } = this.props;

    const isCurrent = this.state.currentIdDirection === currentDirection.id;
    this.getSchedule(isCurrent ? reverseDirection.id : currentDirection.id, isCurrent ? reverseDirection.r_id : currentDirection.r_id);

    Actions.refresh({ title: isCurrent ? reverseDirection.name : currentDirection.name });
  }

  getSchedule = (d_id, r_id, noLoader = false) => {
    this.setState({
      isLoading: !noLoader,
    }, () => {
      window.DB.query({
        sql: `
          SELECT times.pos pos, times.tms tms, stops.n stop, stops.p p, stops.id s_id, stops.isfavorite isfavorite, times.d_id d_id, times.r_id r_id
          FROM times
          LEFT JOIN stops
          ON times.id_s=stops.id
          AND times.d_id=${d_id}
          AND times.r_id=${r_id}
          ORDER BY times.pos`,
      })
        .then((items) => {
          this.setState({
            items: items.filter(({ stop }) => stop),
            currentIdDirection: d_id,
            isLoading: false,
          });
        });
    });
  }

  render() {
    const { currentDirection, reverseDirection } = this.props;
    const { items, currentIdDirection, isLoading } = this.state;

    const isCurrent = currentIdDirection === currentDirection.id;
    const direction = isCurrent ? currentDirection : reverseDirection;

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    return (
      <Loader isLoading={isLoading} style={styles.container}>
        <List style={styles.container}>
          <SwipeListView
            dataSource={ds.cloneWithRows(items)}
            renderRow={({ stop, p, d_id, s_id, tms }, index) => {
              const nextPrev = getNextTime(tms);

              return (
                <View
                  key={index}
                  style={styles.item}
                >
                  <View
                    style={StyleSheet.flatten([ styles.item__type, StyleSheet.create({ i: { backgroundColor: getTransportColor(direction.type) } }).i ])}
                  />
                  <ListItem
                    subtitleStyle={!p ? { height: 0 } : {}}
                    style={styles.item_info}
                    title={stop}
                    subtitle={p}
                    badge={nextPrev ? { element: <NextTransport minutes={nextPrev.minutes} time={nextPrev.time} /> } : null}
                    onPress={() => {
                      Actions[SCREEN_SCHEDULE]({
                        item: {
                          stop,
                          d_id,
                          s_id,
                          r_id: direction.r_id,
                          direction: direction.name,
                          type: direction.type,
                          transport: direction.transport,
                          currentDirection: direction,
                        },
                        in: nextPrev && !isNil(nextPrev.minutes) ? `Через ${makeTimeToReadableFormat(nextPrev.minutes)}` : null,
                        noDirectionNavigation: true,
                      });
                    }}
                  />
                </View>
              );
            }}
            renderHiddenRow={(data, secdId, rowId, rowMap) => (
              <SwipeFavorite
                isFavorite={items[rowId].isfavorite === 1}
                onFavorite={(isFavorite) => {
                  rowMap[`${secdId}${rowId}`].closeRow();

                  setTimeout(() => {
                    const item = items.find(({ s_id }) => items[rowId].s_id === s_id);
                    const itemIndex = items.indexOf(item);

                    window.DB.update({
                      table: 'stops',
                      values: {
                        isfavorite: isFavorite ? 1 : 0,
                      },
                      where: {
                        id: item.s_id,
                      },
                    })
                      .then(() => {
                        this.setState({
                          items: [
                            ...items.slice(0, itemIndex),
                            {
                              ...item,
                              isfavorite: isFavorite,
                            },
                            ...items.slice(itemIndex + 1, items.length),
                          ],
                        });

                        EventEmitter.emit('change__favorite');
                      });
                  }, 500);
                }}
              />
            )}
            rightOpenValue={-75}
          />
        </List>
      </Loader>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrayColor,
    backgroundColor: '#fff',
  },
  item__type: {
    width: 6,
    height: '100%',
    backgroundColor: Colors.busColor,
    marginTop: 1,
    marginBottom: 1,
  },
  item_info: {
    height: 52,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
