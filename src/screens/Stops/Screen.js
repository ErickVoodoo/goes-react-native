/* 
* Screen 
* @module Screens/Stops 
* @flow  
*/

import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { SearchBar, List } from 'react-native-elements';

import EventEmitter from 'react-native-eventemitter';

import request, { isNetworkConnected } from '../../utilities/request';
import { Loader, NoItems, Stop, SwipableFlatList } from '../../components';

import Colors from '../../constants/colors';
import { SETTINGS_KEYS, API_URL, API_KEY } from '../../constants/config';
import { SCREEN_UPDATER, SCREEN_STOP_DIRECTIONS } from '../../constants/routes';

type IProps = {
  navigation: Object,
}

export class Screen extends React.Component {
  props: IProps;
  timer = null;

  state = {
    items: [],
    search: '',
    isLoading: true,
  }

  componentWillMount = () => {
    const { navigation } = this.props;

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
                          navigation.navigate(SCREEN_UPDATER, { recreate: false, getSettings: () => {} });
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
    this.timer = setInterval(() => {
      this.forceUpdate();
    }, 5000);
  }

  componentWillUnmount = () => {
    clearInterval(this.timer);
    EventEmitter.removeListener('change__favorite', this.getStops);
  }

  navigateToStop = (name, s_id) => () => {
    const { navigation } = this.props;
    const { items } = this.state;
    const currentStop = items.find(({ n: sName }) => sName === name);

    navigation.navigate(SCREEN_STOP_DIRECTIONS, { s_id, title: name, p: currentStop.p });
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
          <SwipableFlatList
            rowData={filteredItems.map(({ n, id, key, ...props }) => ({
              rowView: (<Stop
                id={id}
                n={n}
                key={key}
                {...props}
                onPress={this.navigateToStop(n, id)}
                style={{ height: 52 }}
              />),
              id,
              ...props,
            }))}
            table={'stops'}
            style={styles.list}
          /> :
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
    height: 50,
    backgroundColor: '#fff',
  },
  list: { 
    flex: 1,
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
