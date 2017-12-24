/* 
* Screen 
* @module Screen/Favorites 
* @flow  
*/

import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { Actions } from 'react-native-router-flux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EventEmitter from 'react-native-eventemitter';

import Colors from '../../constants/colors';
import { Loader, NoItems, TapBar, Direction, Stop } from '../../components';

import { SCREEN_FAVORITE_DIRECTION, SCREEN_FAVORITE_STOP } from '../../constants/routes';

export class Screen extends React.Component {
  state = {
    stops: [],
    directions: [],
    isLoading: true,
    refreshing: false,
  }

  componentWillMount = () => {
    setTimeout(() => {
      this.getFavorites();
    }, 500);

    EventEmitter.on('change__favorite', this.getFavorites);

    window.ANALYTIC.page(window.ANALYTIC_PAGES.FAVORITES);
  }

  componentWillUnmount = () => {
    EventEmitter.removeAllListeners('change__favorite');
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

  getFavorites = (reload = false) => {
    if (reload) {
      this.setState({
        isLoading: true,
      });
    }

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
          <ScrollableTabView 
            renderTabBar={() => <TapBar />}
            locked
          >
            {stops && !!stops.length &&
              <FlatList
                tabLabel="Остановки"
                data={stops.map(item => ({ ...item, key: `stops__${item.id}` }))}
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this.getFavorites}
                  />
                }
                renderItem={({ item: { key, id, n, ...props } }) => (
                  <Stop
                    id={id}
                    n={n}
                    key={key}
                    {...props}
                    onPress={this.navigateToStop(n, id)}
                  />)
                }
                keyExtractor={item => item.key}
              />
            }
            {directions && !!directions.length &&
              <FlatList
                tabLabel="Маршруты"
                data={directions.map(item => ({ ...item, key: `directions__${item.id}` }))}
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this.getFavorites}
                  />
                }
                renderItem={({ item }) => (
                  <Direction
                    block={[item]}
                    onNavigateToDirection={this.navigateToDirection}
                  />
                )}
                keyExtractor={item => item.key}
              />
            }
          </ScrollableTabView> :
          <NoItems
            noIcon
            message='Добавь нужные остановки или маршруты для того что бы увидеть их тут'
          >
            <TouchableOpacity
              onPress={() => this.getFavorites(true)}
              activeOpacity={0.4}
              style={{ marginTop: 12 }}
            >
              <FontAwesome 
                name={'refresh'}
                size={24}
                color={'#a6a6a6'}
              />
            </TouchableOpacity>
          </NoItems>
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
