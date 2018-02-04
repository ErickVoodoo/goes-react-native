/* 
* Screen 
* @module Screens/Updater 
* @flow  
*/

import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { API_URL, API_KEY, SETTINGS_KEYS } from '../../constants/config';

import { parseAndSave } from '../../utilities/parser';
import request from '../../utilities/request';

type IProps = {
  navigation: Object,
  recreate: boolean;
}

export class Screen extends React.Component {
  props: IProps;

  static route = {
    navigationBar: {
      visible: false,
    },
    styles: {
      gestures: null,
    },
  };

  state = {
    status: 'Расписание загружается...',
  }

  componentDidMount = () => {
    const { navigation: { state: { params: { recreate = false } } } } = this.props;

    const key = window.SETTINGS[SETTINGS_KEYS[7]];
    const version = window.SETTINGS[SETTINGS_KEYS[5]];

    window.DB.select({
      table: 'stops',
      where: { isfavorite: 1 },
    })
      .then((favoriteStops) =>
        window.DB.select({
          table: 'directions',
          where: { isfavorite: 1 },
        })
          .then((favoriteDirections) => {
            if (recreate) {
              window.ANALYTIC.event(window.ANALYTIC_EVENTS.HARD_UPDATE);
    
              window.DB.truncate({ table: 'stops' });
              window.DB.truncate({ table: 'times' });
              window.DB.truncate({ table: 'directions' });
              window.DB.truncate({ table: 'routes' });
            }
    
            request({
              path: `${API_URL(key)}schedule?key=${API_KEY}&app_version=${window.SETTINGS[SETTINGS_KEYS[10]]}${!recreate ? `&version=${version}` : ''}`,
              method: 'POST',
            })
              .then((response) =>
                parseAndSave(response, !recreate)
                  .then((timetable) => {
                    this.setState({
                      status: 'Сохранение в базу данных...',
                    });
    
                    if (timetable) {
                      return Promise.resolve(timetable);
                    }
    
                    this.updateScheduleVersion(key);
                  })
                  .then((timetable) => {
                    if (!timetable) {
                      return;
                    }
    
                    const { stops, routes, directions, times } = timetable;
    
                    if (stops && stops.length) {
                      stops
                        .map((item) => 
                          ({ 
                            ...item, 
                            isfavorite: (() => {
                              const isFavorite = favoriteStops.find(({ id }) => item.id === id);
                              return isFavorite ? isFavorite.isfavorite : 0;
                            })(),
                          }))
                        .forEach(stop => {
                          window.DB.update({
                            table: 'stops',
                            values: stop,
                            where: {
                              id: stop.id,
                            },
                          });
                        });
                    }
    
                    if (routes && routes.length) {
                      routes.forEach(route => {
                        window.DB.update({
                          table: 'routes',
                          values: route,
                          where: {
                            id: route.id,
                          },
                        });
                      });
                    }
    
                    if (directions && directions.length) {
                      directions
                        .map((item) => ({ 
                          ...item, 
                          isfavorite: (() => {
                            const isFavorite = favoriteDirections.find(({ id }) => item.id === id);
                            return isFavorite ? isFavorite.isfavorite : 0;
                          })(),
                        }))
                        .forEach(direction => {
                          window.DB.update({
                            table: 'directions',
                            values: direction,
                            where: {
                              id: direction.id,
                            },
                          });
                        });
                    }
    
                    if (times && times.length) {
                      window.DB.updateSync({
                        table: 'times',
                        values: times,
                        where: (value) => ({
                          d_id: value.d_id,
                          id_s: value.id_s,
                          r_id: value.r_id,
                        }),
                      })
                        .then(() => {
                          this.updateScheduleVersion(key);
                        });
                    } else {
                      this.updateScheduleVersion(key);
                    }
                  }),
              )
          }),
      )
  }

  updateScheduleVersion = (key: string) => {
    const { navigation } = this.props;

    request({
      path: `${API_URL(key)}metadata?key=${API_KEY}&app_version=${window.SETTINGS[SETTINGS_KEYS[10]]}`,
      method: 'POST',
    })
      .then((res) => {
        const { schedule } = JSON.parse(res);
        window.DB.update({ 
          table: 'settings', 
          values: { value: Number(schedule) }, 
          where: { key: SETTINGS_KEYS[5] },
        });
        window.SETTINGS[SETTINGS_KEYS[5]] = Number(schedule);
        
        window.DB.truncate({
          table: 'meta',
        })
          .then(() =>
            window.DB.insert({
              table: 'meta',
              values: JSON.parse(res),
            }),
          )
          .then(() =>
            window.DB.select({
              table: 'directions',
            }),
          )
          .then(() => {
            setTimeout(() => {
              navigation.goBack();
              navigation.state.params.getSettings();
            }, 2000);
          });
      });
  }

  render() {
    const { status } = this.state;

    const MAIN_APPLICATION_COLOR = window.SETTINGS[SETTINGS_KEYS[0]];

    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          animating
        />
        <Text style={styles.container__text}>
          {status}
        </Text>
        <LinearGradient
          colors={[MAIN_APPLICATION_COLOR, 'transparent']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '100%',
            width: '100%',
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container__text: {
    fontSize: 18,
    marginTop: 24,
  },
});
