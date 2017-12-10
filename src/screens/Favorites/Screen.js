/* 
* Screen 
* @module Screen/Favorites 
* @flow  
*/

import React from 'react';
import { StyleSheet, FlatList, ActionSheetIOS } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { Actions } from 'react-native-router-flux';
import EventEmitter from 'react-native-eventemitter';

import Colors from '../../constants/colors';
import { Loader, ListItem, NoItems, TapBar, Direction } from '../../components';

import { SCREEN_FAVORITE_DIRECTION, SCREEN_FAVORITE_STOP } from '../../constants/routes';

const UNFAVORITE = [
  'Удалить',
  'Закрыть',
];

export class Screen extends React.Component {
  state = {
    stops: [],
    directions: [],
    isLoading: true,
  }

  componentWillMount = () => {
    setTimeout(() => {
      this.getFavorites();
    }, 500);

    EventEmitter.on('change__favorite', () => {
      this.getFavorites();
    });

    EventEmitter.on('change__favorite__directions', () => {
      this.getFavorites();
    });

    window.ANALYTIC.page(window.ANALYTIC_PAGES.FAVORITES);
  }

  componentWillUnmount = () => {
    EventEmitter.removeAllListeners('change__favorite');
    EventEmitter.removeAllListeners('change__favorite__directions');
  }

  navigateToStop = (name, s_id) => () => {
    const { stops } = this.state;
    const currentStop = stops.find(({ n: sName }) => sName === name);

    Actions[SCREEN_FAVORITE_STOP]({
      s_id,
      title: name,
      p: currentStop.p,
    });
  }

  navigateToDirection = (block) => () => {
    Actions[SCREEN_FAVORITE_DIRECTION]({
      r_id: block[0].r_id,
      title: block[0].name,
      currentDirection: block[0],
    });
  }

  getFavorites = () => {
    window.DB.select({
      table: 'stops',
      where: { isfavorite: 1 },
    })
      .then((stops) => {
        this.setState({
          stops,
          isLoading: false,
        });
      });

    window.DB.query({
      sql: `SELECT routes.id as id, directions.id as id, directions.isfavorite isfavorite, directions.r_id as r_id, directions.name as name, routes.name as transport, routes.type as type
        FROM directions
        LEFT JOIN routes
        ON directions.r_id = routes.id
        ORDER BY routes.id, routes.name`,
    })
      .then((directions) => {
        this.setState({
          directions: directions.filter(({ isfavorite }) => isfavorite).sort((a, b) => window.NaturalSort(a.transport, b.transport)),
          isLoading: false,
        });
      });
  }

  render() {
    const { stops, directions, isLoading } = this.state;

    return (
      <Loader isLoading={isLoading} style={styles.container}>
        { (directions && !!directions.length) || (stops && !!stops.length) ?
          <ScrollableTabView renderTabBar={() => <TapBar />}>
            {stops && !!stops.length &&
              <FlatList
                tabLabel="Остановки"
                data={stops.map(item => ({ ...item, key: `stops__${item.id}` }))}
                renderItem={({ item: { id, n, p } }) => {
                  return (
                    <ListItem
                      style={styles.list_item}
                      title={n}
                      subtitle={p}
                      onPress={this.navigateToStop(n, id)}
                      onLongPress={() => {
                        ActionSheetIOS.showActionSheetWithOptions({
                          options: UNFAVORITE,
                          cancelButtonIndex: 1,
                          destructiveButtonIndex: 0,
                        },
                          (buttonIndex) => {
                            if (buttonIndex === 0) {
                              window.DB.update({
                                table: 'stops',
                                values: {
                                  isfavorite: 0,
                                },
                                where: {
                                  id,
                                },
                              })
                                .then(() => {
                                  EventEmitter.emit('change__favorite');
                                });
                            }
                          },
                        );
                      }}
                    />
                  );
                }}
                keyExtractor={item => item.key}
              />
            }
            {directions && !!directions.length &&
              <FlatList
                tabLabel="Маршруты"
                data={directions.map(item => ({ ...item, key: `directions__${item.id}`}))}
                renderItem={({ item }) => {
                  return (
                    <Direction
                      block={[item]}
                      onNavigateToDirection={this.navigateToDirection}
                    />
                  );
                }}
                keyExtractor={item => item.key}
              />
            }
          </ScrollableTabView> :
          <NoItems
            noIcon
            message='Добавь нужные остановки или маршруты для того что бы увидеть их тут'
          />
        }
      </Loader>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  search: {
    width: '100%',
    flexShrink: 1,
  },
  list: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  list_item: {
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrayColor,
  },
});
