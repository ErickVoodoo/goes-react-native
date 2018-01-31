/* 
* Screen 
* @module Screen/Favorites 
* @flow  
*/

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EventEmitter from 'react-native-eventemitter';

import Colors from '../../constants/colors';
import { getTwinsDirections } from '../../utilities/parser';
import { Loader, NoItems, TapBar, Direction, Stop, SwipableFlatList } from '../../components';
import { SCREEN_DIRECTION_STOPS, SCREEN_STOP_DIRECTIONS } from '../../constants/routes';

type IProps = {
  navigation: Object,
};

export class Screen extends React.Component {
  props: IProps;

  state = {
    stops: [],
    directions: [],
    isLoading: true,
  }

  componentWillMount = () => {
    setTimeout(() => {
      this.getFavorites();
    }, 500);

    EventEmitter.on('change__favorite', this.getFavorites);

    window.ANALYTIC.page(window.ANALYTIC_PAGES.FAVORITES);
  }

  componentWillUnmount = () => {
    EventEmitter.removeListener('change__favorite', this.getFavorites);
  }

  navigateToStop = (name, s_id) => () => {
    const { navigation } = this.props;
    const { stops } = this.state;
    const currentStop = stops.find(({ n: sName }) => sName === name);

    navigation.navigate(SCREEN_STOP_DIRECTIONS, {
      s_id,
      title: name,
      p: currentStop.p,
    });
  }

  navigateToDirection = (block) => () => {
    const { navigation } = this.props;

    navigation.navigate(SCREEN_DIRECTION_STOPS, {
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
              <SwipableFlatList
                tabLabel="Остановки"
                rowData={stops.map(({ n, id, ...props }) => ({
                  rowView: (<Stop
                    id={id}
                    n={n}
                    key={`stops__${id}`}
                    {...props}
                    onPress={this.navigateToStop(n, id)}
                    style={{ height: 52 }}
                  />),
                  id,
                  ...props,
                }))}
                table={'stops'}
                style={styles.list}
              />
            }
            {directions && !!directions.length &&
              <SwipableFlatList
                tabLabel={'Маршруты'}
                rowData={directions.map(({ id, transport, type, name, r_id, ...props }) => ({
                  rowView: (<Direction
                    transport={transport}
                    type={type}
                    direction={name}
                    onPress={() => {
                      const block = getTwinsDirections({ directions, d_id: id, r_id });
        
                      this.navigateToDirection(block)();
                    }}
                  />),
                  id,
                  ...props,
                }))}
                table={'directions'}
              />
            }
            {/* {directions && !!directions.length &&
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
            } */}
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
