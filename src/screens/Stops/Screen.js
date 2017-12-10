/* 
* Screen 
* @module Screens/Stops 
* @flow  
*/

import React from 'react';
import { StyleSheet, ListView, Alert } from 'react-native';
import { SearchBar, List } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Actions } from 'react-native-router-flux';

import EventEmitter from 'react-native-eventemitter';

import request, { isNetworkConnected } from '../../utilities/request';
import { Loader, ListItem, NoItems, SwipeFavorite } from '../../components';

import Colors from '../../constants/colors';
import { SETTINGS_KEYS, API_URL, API_KEY } from '../../constants/config';
import { SCREEN_UPDATER, SCREEN_STOP_DIRECTIONS } from '../../constants/routes';

export class Screen extends React.Component {
  state = {
    items: [],
    search: '',
    isLoading: true,
  }

  componentWillMount = () => {
    setTimeout(() => {
      this.getStops();
    }, 500);

    EventEmitter.on('change__favorite', this.getStops);

    const key = window.SETTINGS[SETTINGS_KEYS[7]];
    const isAutoupdate = window.SETTINGS[SETTINGS_KEYS[6]];
    const currentVersion = window.SETTINGS[SETTINGS_KEYS[5]];

    if (isAutoupdate === '1') {
      isNetworkConnected()
        .then((isConnected) => {
          if (isConnected) {
            request({
              path: `${API_URL(key)}metadata?key=${API_KEY}&app_version=${window.SETTINGS[SETTINGS_KEYS[10]]}`,
              method: 'POST',
              noInternetCheck: true,
            })
              .then((response) => {
                const { schedule } = JSON.parse(response);

                if (Number(schedule) > Number(currentVersion)) {
                  Alert.alert(
                    'Обновление',
                    'Доступно новое расписание. Обновить?',
                    [
                      {
                        text: 'Загрузить',
                        onPress: () => {
                          Actions[SCREEN_UPDATER]();
                        },
                      },
                      {
                        text: 'Отмена',
                        onPress: () => {},
                        style: 'cancel',
                      },
                    ],
                    { cancelable: false },
                  );
                }
              })
              .catch(() => {
                Alert.alert(
                  'Обновление недоступно',
                  'Обнови приложение до последней версии из App Store',
                  [{
                    text: 'Закрыть',
                    onPress: () => {},
                    style: 'cancel',
                  }],
                  { cancelable: false },
                );
              });
          }
        });
    }

    window.ANALYTIC.page(window.ANALYTIC_PAGES.STOPS);
  }

  componentWillUnmount = () => {
    EventEmitter.removeAllListeners('change__favorite');
  }

  navigateToStop = (name, s_id) => () => {
    const { items } = this.state;
    const currentStop = items.find(({ n: sName }) => sName === name);

    Actions[SCREEN_STOP_DIRECTIONS]({ s_id, title: name, p: currentStop.p });
  }

  getStops = () => {
    window.DB.select({
      table: 'stops',
    })
      .then((stops) => {
        this.setState({
          items: stops,
          isLoading: false,
        });
      });
  }

  render() {
    const { items, isLoading, search } = this.state;

    const filteredItems = items ? items
      .filter(({ n }) => n.toLowerCase().includes(search.toLowerCase()))
      .map((item) => ({ ...item, key: item.id })) : [];

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    return (
      <Loader isLoading={isLoading} style={styles.container}>
        <SearchBar
          round
          lightTheme
          autoComplete={false}
          autoCorrect={false}
          placeholder='Поиск по остановкам'
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
        { filteredItems && filteredItems.length ?
          <List style={styles.list}>
            <SwipeListView
              dataSource={ds.cloneWithRows(filteredItems)}
              renderRow={({ id, n, p }) =>
                (<ListItem
                  key={`stops_${id}`}
                  style={styles.list_item}
                  title={n}
                  subtitle={p}
                  onPress={this.navigateToStop(n, id)}
                />)
              }
              renderHiddenRow={(data, secdId, rowId, rowMap) => (
                <SwipeFavorite
                  isFavorite={filteredItems[rowId].isfavorite === 1}
                  onFavorite={(isFavorite) => {
                    rowMap[`${secdId}${rowId}`].closeRow();

                    setTimeout(() => {
                      const item = items.find(({ id }) => filteredItems[rowId].id === id);
                      const itemIndex = items.indexOf(item);

                      window.DB.update({
                        table: 'stops',
                        values: {
                          isfavorite: isFavorite ? 1 : 0,
                        },
                        where: {
                          id: item.id,
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
          </List> :
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
    width: '100%',
    flexShrink: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  list_item: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrayColor,
  },
});
