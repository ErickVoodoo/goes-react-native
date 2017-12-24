/* 
* Screen 
* @module Screens/Stops 
* @flow  
*/

import React from 'react';
import { StyleSheet, FlatList, Alert } from 'react-native';
import { SearchBar, List } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';

import EventEmitter from 'react-native-eventemitter';

import request, { isNetworkConnected } from '../../utilities/request';
import { Loader, NoItems, Stop } from '../../components';

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
      .map((item) => ({ ...item, key: `stop_${item.id}` })) : [];

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
            <FlatList
              data={filteredItems}
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
