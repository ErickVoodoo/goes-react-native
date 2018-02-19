/* 
* Screen 
* @module Screens/CitySelector 
* @flow  
*/

import React from 'react';
import { ScrollView, StyleSheet, Text, ActivityIndicator, View, TouchableHighlight } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { Fade } from '../../components';
import request from '../../utilities/request';
import { parseAndSave } from '../../utilities/parser';
import { CITIES, API_URL, API_KEY, SETTINGS_KEYS } from '../../constants/config';
import Colors from '../../constants/colors';
import { replaceWith } from '../../utilities/common';
import { SCREEN_DRAWER } from '../../constants/routes';

type IProps = {
  navigation: Object,
};

type IState = {
  selectedCity?: string | number | null,
  isLoading: boolean,
}

export class Screen extends React.Component {
  props: IProps;

  state: IState = {
    selectedCity: null,
    isLoading: false,
  }

  onSelectCity = (key: string | number) => {
    const { isLoading } = this.state;

    if (!isLoading) {
      this.setState({
        selectedCity: key,
      });
    }
  }

  onLoadSchedule = () => {
    const { navigation } = this.props;
    const { selectedCity, isLoading } = this.state;
    console.log('Start', new Date());
    if (selectedCity && !isLoading) {
      this.setState({
        isLoading: true,
      });

      window.DB.truncate({ table: 'stops' });
      window.DB.truncate({ table: 'times' });
      window.DB.truncate({ table: 'directions' });
      window.DB.truncate({ table: 'routes' });
      window.DB.truncate({ table: 'meta' });
      console.log('Request', new Date());
      request({
        path: `${API_URL(selectedCity)}metadata?key=${API_KEY}&app_version=${window.SETTINGS[SETTINGS_KEYS[10]]}`,
        method: 'POST',
      })
        .then((metadataResponse) => {
          console.log('Metadata', new Date());

          return window.DB.truncate({
            table: 'meta',
          })
            .then(() => 
              window.DB.insert({
                table: 'meta',
                values: JSON.parse(metadataResponse),
              }),
            )
            .then(() => {
              const { city, schedule } = JSON.parse(metadataResponse);
              window.DB.update({ 
                table: 'settings', 
                values: { value: city }, 
                where: { key: SETTINGS_KEYS[7] },
              });

              window.DB.update({ 
                table: 'settings', 
                values: { value: schedule }, 
                where: { key: SETTINGS_KEYS[5] },
              });
              console.log('Request', new Date());
              request({
                path: `${API_URL(selectedCity)}schedule?key=${API_KEY}&app_version=${window.SETTINGS[SETTINGS_KEYS[10]]}`,
                method: 'POST',
              })
                .then(scheduleResponse => {
                  console.log('Schedule', new Date());

                  return parseAndSave(scheduleResponse, false)
                    .then(() =>
                      window.DB.select({
                        table: 'settings',
                      })
                        .then((settings) => {
                          console.log('Saved', new Date());
                          window.SETTINGS = settings.reduce((total, next) => {
                            const temp = total;
                            temp[next.key] = next.value;
                            return temp;
                          }, {});

                          window.DB.select({
                            table: 'stops',
                          })
                            .then(() => {
                              console.log('Push navigation', new Date());
                              navigation.dispatch(replaceWith(SCREEN_DRAWER));
                            });
                        }),
                    )
                });
            });
        })
    }
  }

  render() {
    const { isLoading, selectedCity } = this.state;

    const MAIN_APPLICATION_COLOR = window.SETTINGS[SETTINGS_KEYS[0]];
    const selected = CITIES.find(({ key }) => key === selectedCity);

    return (
      <LinearGradient
        style={[styles.container]}
        colors={['#63E2FF', '#B066FE']}
        start={{ x: 0, y: 0.1 }} 
        end={{ x: 0.1, y: 1 }}
      >
        <View style={[styles.container__statusbar, { backgroundColor: MAIN_APPLICATION_COLOR }]} />
        <View style={[styles.flex, styles.container__header]}>
          <Fade withoutFlex delay={1000} duration={1200}>
            <Text style={styles.container__header__title}>
              Привет, какой город тебе нужен?
            </Text>
          </Fade>
          <Fade withoutFlex delay={2200} duration={1200}>
            <Text style={styles.container__header__subtitle}>
              Мы загрузим для тебя самое актуальное расписание
            </Text>
          </Fade>
        </View>
        <View style={styles.container__list}>
          <Fade delay={3400} duration={1200} withoutFlex>
            <ScrollView>
              <View>
                { CITIES.map(({ city, key }) =>
                  (
                    <TouchableHighlight
                      key={key}
                      underlayColor='rgba(255, 255, 255, 0.8)'
                      activeOpacity={0.8}
                      onPress={() => this.onSelectCity(key)}
                    >
                      <View style={[styles.menu__button, key === this.state.selectedCity ? styles['menu__button--selected'] : null]}>
                        <Text style={[styles.menu__button__text, key === this.state.selectedCity ? { color: MAIN_APPLICATION_COLOR } : null]}>
                          {city}
                        </Text>
                      </View>
                    </TouchableHighlight>
                  ))
                }
              </View>
            </ScrollView>
          </Fade>
        </View>
        <Fade delay={3400} duration={1200} withoutFlex>
          <TouchableHighlight
            onPress={() => this.onLoadSchedule()}
            activeOpacity={!this.state.selectedCity || isLoading ? 1 : 0.8}
          >
            <View style={[styles.flex, styles.container__choose, !this.state.selectedCity || isLoading ? styles['container__choose--disabled'] : null, { backgroundColor: MAIN_APPLICATION_COLOR }]}>
              {isLoading ?
                <ActivityIndicator color='#ffffff' /> :
                <Text style={styles.container__choose__text}>
                  ЗАГРУЗИТЬ
                </Text>
              }
              {!isLoading && selectedCity && <Text style={{ fontSize: 12, color: '#fff' }}>{selected ? `(~${selected.delay} сек.)` : ''}</Text>}
            </View>
          </TouchableHighlight>
        </Fade>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'transparent',
  },
  container__statusbar: {
    width: '100%',
  },
  container__header: {
    height: '40%',
    padding: 12,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  container__header__title: {
    width: '100%',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 16,
    backgroundColor: 'transparent',
    color: '#fff',
  },
  container__header__subtitle: {
    width: '100%',
    fontSize: 16,
    // color: Colors.grayColor,
    textAlign: 'left',
    paddingRight: '20%',
    marginBottom: 16,
    color: '#fff',
  },
  container__footer: {
    height: 50,
    width: '100%',
    backgroundColor: Colors.tintColor,
  },
  container__list: {
    flex: 1,
    position: 'relative',
  },
  container__list__gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 40,
  },
  container__list__gradient__image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.2,
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container__choose: {
    height: 50,
    minHeight: 50,
    width: '100%',
    // backgroundColor: Colors.tintColor,
  },
  'container__choose--disabled': {
    backgroundColor: Colors.grayColor,
    opacity: 0.2,
  },
  container__choose__text: {
    color: Colors.noticeText,
    fontSize: 18,
  },
  menu__button: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu__button__text: {
    fontSize: 18,
    textAlign: 'center',
    height: 20,
    backgroundColor: 'transparent',
    color: '#fff',
  },
  'menu__button--selected': {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
});
