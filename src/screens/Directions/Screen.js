/* 
* Screen 
* @module Screens/Direction 
* @flow  
*/

import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { SearchBar, List } from 'react-native-elements';
import EventEmitter from 'react-native-eventemitter';

import { Loader, TapBar, NoItems, Direction } from '../../components';
import { getTabCounts, directoriesToBlocks } from '../../utilities/parser';

import { SCREEN_DIRECTION_STOPS } from '../../constants/routes';

type IProps = {
  navigation: Object,
}

export class Screen extends React.Component {
  props: IProps;
  timer: null;

  state = {
    items: [],
    search: '',
    isLoading: true,
  }

  componentWillMount = () => {
    setTimeout(() => {
      this.getDirections();
    }, 500);

    EventEmitter.on('change__favorite', () => {
      this.getDirections();
    });

    this.timer = setInterval(() => {
      this.forceUpdate();
    }, 5000);

    window.ANALYTIC.page(window.ANALYTIC_PAGES.DIRECTIONS);
  }

  componentWillUnmount = () => {
    EventEmitter.removeAllListeners('change__favorite');
    clearInterval(this.timer);
  }

  navigateToDirection = (block) => () => {
    this.props.navigation.navigate(SCREEN_DIRECTION_STOPS, {
      r_id: block[0].r_id,
      title: block[0].name,
      type: block[0].type,
      currentDirection: block[0],
      reverseDirection: block[1],
    });
  }

  getDirections = () => {
    window.DB.query({
      sql: `SELECT routes.id as id, directions.id as id, directions.isfavorite isfavorite, directions.r_id as r_id, directions.name as name, routes.name as transport, routes.type as type
        FROM directions
        LEFT JOIN routes
        ON directions.r_id = routes.id
        ORDER BY routes.id, routes.name`,
    })
      .then((items) => {
        this.setState({
          items: items.sort((a, b) => window.NaturalSort(a.transport, b.transport)),
          isLoading: false,
        });
      });
  }

  render() {
    const { items, search, isLoading } = this.state;

    const filteredItems = items
      .filter(({ name, transport }) => name.toLowerCase().includes(search.toLowerCase()) || transport.toString().includes(search));

    const buses = directoriesToBlocks(filteredItems
      .filter(({ type }) => type === 0)
      .sort((a, b) => window.NaturalSort(a.transport, b.transport))
      .map((item) => ({ ...item, key: `bus_${item.id}` })));

    const trolleybuses = directoriesToBlocks(filteredItems
      .filter(({ type }) => type === 1)
      .sort((a, b) => window.NaturalSort(a.transport, b.transport))
      .map((item) => ({ ...item, key: `trolley_${item.id}` })));

    const tramms = directoriesToBlocks(filteredItems
      .filter(({ type }) => type === 2)
      .sort((a, b) => window.NaturalSort(a.transport, b.transport))
      .map((item) => ({ ...item, key: `tramm_${item.id}` })));

    const metro = directoriesToBlocks(filteredItems
      .filter(({ type }) => type === 3)
      .sort((a, b) => window.NaturalSort(a.transport, b.transport))
      .map((item) => ({ ...item, key: `metro_${item.id}` })));

    return (
      <Loader isLoading={isLoading} style={styles.container}>
        <SearchBar
          round
          lightTheme
          autoComplete={false}
          autoCorrect={false}
          placeholder='Поиск по маршрутам'
          containerStyle={styles.search}
          clearButtonMode='always'
          onChangeText={(searchText) => {
            this.setState({
              search: searchText,
            });
          }}
          inputStyle={{
            backgroundColor: '#fff',
          }}
        />
        {getTabCounts('bus', items) || getTabCounts('trolley', items) || getTabCounts('tramms', items) || getTabCounts('metro', items) ?
          <ScrollableTabView 
            locked 
            renderTabBar={() => <TapBar />}
          >
            { getTabCounts('bus', items) !== 0 &&
              <List tabLabel="Автобусы" style={styles.tabView}>
                {buses && buses.length ?
                  <FlatList
                    data={buses}
                    renderItem={({ item }) =>
                      (<Direction
                        block={item}
                        onNavigateToDirection={this.navigateToDirection}
                      />)
                    }
                    keyExtractor={item => item[0].key}
                  /> :
                  <NoItems />
                }
              </List>
            }
            { getTabCounts('trolley', items) !== 0 &&
              <List tabLabel="Троллейбусы" style={styles.tabView}>
                { trolleybuses && trolleybuses.length ?
                  <FlatList
                    data={trolleybuses}
                    renderItem={({ item }) =>
                      (<Direction
                        block={item}
                        onNavigateToDirection={this.navigateToDirection}
                      />)
                    }
                    keyExtractor={item => item[0].key}
                  /> :
                  <NoItems />
                }
              </List>
            }
            { getTabCounts('tramms', items) !== 0 &&
              <List tabLabel="Трамваи" style={styles.tabView}>
                { tramms && tramms.length ?
                  <FlatList
                    data={tramms}
                    renderItem={({ item }) =>
                      (<Direction
                        block={item}
                        onNavigateToDirection={this.navigateToDirection}
                      />)
                    }
                    keyExtractor={item => item[0].key}
                  /> :
                  <NoItems />
                }
              </List>
            }
            { getTabCounts('metro', items) !== 0 &&
              <List tabLabel="Метро" style={styles.tabView}>
                { metro && metro.length ?
                  <FlatList
                    data={metro}
                    renderItem={({ item }) =>
                      (<Direction
                        block={item}
                        onNavigateToDirection={this.navigateToDirection}
                      />)
                    }
                    keyExtractor={item => item[0].key}
                  /> :
                  <NoItems />
                }
              </List>
            }
          </ScrollableTabView> :
          <NoItems />
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
    backgroundColor: '#fff',
    width: '100%',
  },
  tabView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default Screen;
