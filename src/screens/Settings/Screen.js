/* 
* Screen 
* @module Screens/Settings 
* @flow  
*/

import React from 'react';
import { Divider, Text } from 'react-native-elements';
import { isNil } from 'lodash';
import { StyleSheet, ScrollView, View, TouchableOpacity, Modal, Button, Switch, Alert, Linking } from 'react-native';
import { ColorPicker, fromHsv } from 'react-native-color-picker';

import { Loader, ListItem, Fade } from '../../components';
import Colors from '../../constants/colors';
import request, { isNetworkConnected, NoInternetConnection } from '../../utilities/request';

import { CITIES, SETTINGS_KEYS, API_KEY, API_URL } from '../../constants/config';

import { SCREEN_UPDATER, SCREEN_CITY_SELECTOR } from '../../constants/routes';

type IProps = {
  navigation: Object,
  setSettings: Function,
}

export class Screen extends React.Component {
  props: IProps;

  state = {
    settings: null,
    isLoading: true,
    isUpdatingSchedule: false,
    freshMeta: null,
    modalColorPicker: false,
    colorSelection: {},
  }

  componentWillMount = () => {
    window.ANALYTIC.page(window.ANALYTIC_PAGES.SETTINGS);
  }

  componentWillUnmount = () => {
    window.isNeedUpdateApp = false;
  }

  componentDidMount = () => {
    setTimeout(() => {
      this.getSettings(() => {
        const settings = this.getSettingsObject();

        isNetworkConnected()
          .then((isConnected) => {
            if (isConnected) {
              request({
                path: `${API_URL(settings[SETTINGS_KEYS[7]])}metadata?key=${API_KEY}&app_version=${window.SETTINGS[SETTINGS_KEYS[10]]}`,
                method: 'POST',
              })
                .then((response) => {
                  if (!response) {
                    return Promise.reject();
                  }
      
                  return window.DB.truncate({
                    table: 'meta',
                  })
                    .then(() =>
                      window.DB.insert({
                        table: 'meta',
                        values: JSON.parse(response),
                      }),
                    )
                    .then(() => {
                      this.setState({
                        freshMeta: JSON.parse(response),
                      });
                    })
                })
                .catch(() => {
                  window.isNeedUpdateApp = true;
                });
            }
          }).catch(() => {
            
          });
      });
    }, 500);
  }

  getSettings = (callback?: Function) => {
    const { setSettings } = this.props;

    this.setState({
      isLoading: true,
    }, () => {
      window.DB.select({
        table: 'settings',
      })
        .then((response) => {
          this.setState({
            settings: response,
            isLoading: false,
          }, () => {
            if (callback) {
              callback();
            }
          });

          setSettings({ payload: response });
        });
    });
  }

  getSettingsObject = () => {
    const { settings } = this.state;
    const s = {};

    if (settings) {
      settings.forEach(({ key, value }) => {
        s[key] = value;
      });
    }

    return s;
  }

  onSaveColor = (color: string) => {
    const { colorSelection } = this.state;

    window.DB.update({
      table: 'settings',
      where: { key: colorSelection.colorKey },
      values: {
        value: color || colorSelection.tempColor,
      },
    })
      .then(() => {
        this.setState({
          modalColorPicker: false,
          colorSelection: {},
        });

        window.isNeedThemeReload = true;
        this.getSettings();
      });
  }

  timerColorPicker = null;

  render() {
    const { navigation } = this.props;
    const { colorSelection, isLoading, isUpdatingSchedule, freshMeta = {} } = this.state;

    const settings = this.getSettingsObject();

    return (
      <Loader isLoading={isLoading} style={styles.container}>
        <ScrollView style={styles.container}>
          <Text h4 style={{ padding: 8 }}>Глобальные</Text>
          <Divider style={{ backgroundColor: '#BEBEBE' }} />
          <Loader isLoading={isUpdatingSchedule} background>
            <ListItem
              title={'Обновить расписание'}
              subtitle={`Версия: ${settings[SETTINGS_KEYS[5]]}${freshMeta && freshMeta.schedule ? `. Доступная: ${freshMeta.schedule}` : ''}`}
              onPress={() => {
                if (freshMeta && freshMeta.schedule) {
                  const { schedule } = freshMeta;

                  if (window.isNeedUpdateApp) {
                    Alert.alert(
                      'Обновление недоступно',
                      'Обнови приложение до последней версии из App Store',
                        [{
                          text: 'Закрыть', 
                          onPress: () => {}, 
                          style: 'cancel',
                        }],
                        { 
                          cancelable: false,
                        },
                    );

                    return;
                  }

                  if (settings[SETTINGS_KEYS[5]] < schedule) {
                    isNetworkConnected()
                      .then((isConnected) => {
                        if (isConnected) {
                          navigation.navigate(SCREEN_UPDATER, { recreate: false, getSettings: this.getSettings });
                        } else {
                          return Promise.reject();
                        }

                        return Promise.resolve();
                      }).catch(() => {
                        NoInternetConnection();
                      });
                  }
                }
              }}
              rightIcon={{ name: 'chevron-right', color: !freshMeta || settings[SETTINGS_KEYS[5]] >= freshMeta.schedule ? '#fff' : '#BEBEBE' }}
            />
            <ListItem
              title={'Сменить город'}
              subtitle={!isNil(settings[SETTINGS_KEYS[7]]) ? `Текущий город: ${CITIES.find(({ key }) => key === settings[SETTINGS_KEYS[7]]).city}` : ''}
              onPress={() => {
                window.ANALYTIC.event(window.ANALYTIC_EVENTS.CHANGE_CITY);

                if (window.isNeedUpdateApp) {
                  Alert.alert(
                    'Изменение города недоступно',
                    'Обнови приложение до последней версии из App Store',
                      [{
                        text: 'Закрыть', 
                        onPress: () => {}, 
                        style: 'cancel',
                      }],
                    { 
                      cancelable: false,
                    },
                  );

                  return;
                }

                isNetworkConnected()
                  .then((isConnected) => {
                    if (isConnected) {
                      navigation.navigate(SCREEN_CITY_SELECTOR, { isChangingCity: true });
                    } else {
                      return Promise.reject();
                    }

                    return Promise.resolve();
                  }).catch(() => {
                    NoInternetConnection();
                  });
              }}
            />
            <ListItem
              title={'Автопроверка обновлений'}
              subtitle={'Проверка нового расписания при старте'}
              rightIcon={
                <Switch
                  onValueChange={(value) => {
                    window.ANALYTIC.event(window.ANALYTIC_EVENTS.SET_AUTOUPDATE);

                    window.DB.update({
                      table: 'settings',
                      values: {
                        value: value ? '1' : '0',
                      },
                      where: {
                        key: SETTINGS_KEYS[6],
                      },
                    })
                      .then(() => {
                        this.getSettings(() => {
                          this.forceUpdate();
                        });
                      })
                  }}
                  value={Number(settings[SETTINGS_KEYS[6]]) === 1}
                />
              }
            />
          </Loader>
          <Text h4 style={{ padding: 8 }}>Цветовая схема</Text>
          {window.isNeedThemeReload &&
            <Text h6 style={{ padding: 8, paddingTop: 0, color: '#ffaa00' }}>Необходима перезагрузка приложения</Text>
          }
          <Divider style={{ backgroundColor: '#BEBEBE' }} />
          <ListItem
            title={'Цвет приложения'}
            onPress={() => {
              this.setState({
                modalColorPicker: true,
                colorSelection: {
                  color: settings.MAIN_APPLICATION_COLOR,
                  colorKey: 'MAIN_APPLICATION_COLOR',
                },
              });
            }}
            rightIcon={
              <ColorCircle
                color={settings.MAIN_APPLICATION_COLOR}
                onPress={() => {
                  this.setState({
                    modalColorPicker: true,
                    colorSelection: {
                      color: settings.MAIN_APPLICATION_COLOR,
                      colorKey: 'MAIN_APPLICATION_COLOR',
                    },
                  });
                }}
              />
            }
          />
          <ListItem
            title={'Цвет автобусов'}
            onPress={() => {
              this.setState({
                modalColorPicker: true,
                colorSelection: {
                  color: settings.BUS_COLOR,
                  colorKey: 'BUS_COLOR',
                },
              });
            }}
            rightIcon={
              <ColorCircle
                color={settings.BUS_COLOR}
                onPress={() => {
                  this.setState({
                    modalColorPicker: true,
                    colorSelection: {
                      color: settings.BUS_COLOR,
                      colorKey: 'BUS_COLOR',
                    },
                  });
                }}
              />
            }
          />
          <ListItem
            title={'Цвет троллейбусов'}
            onPress={() => {
              this.setState({
                modalColorPicker: true,
                colorSelection: {
                  color: settings.TROLL_COLOR,
                  colorKey: 'TROLL_COLOR',
                },
              });
            }}
            rightIcon={
              <ColorCircle
                color={settings.TROLL_COLOR}
                onPress={() => {
                  this.setState({
                    modalColorPicker: true,
                    colorSelection: {
                      color: settings.TROLL_COLOR,
                      colorKey: 'TROLL_COLOR',
                    },
                  });
                }}
              />
            }
          />
          <ListItem
            title={'Цвет трамваев'}
            onPress={() => {
              this.setState({
                modalColorPicker: true,
                colorSelection: {
                  color: settings.TRAMM_COLOR,
                  colorKey: 'TRAMM_COLOR',
                },
              });
            }}
            rightIcon={
              <ColorCircle
                color={settings.TRAMM_COLOR}
                onPress={() => {
                  this.setState({
                    modalColorPicker: true,
                    colorSelection: {
                      color: settings.TRAMM_COLOR,
                      colorKey: 'TRAMM_COLOR',
                    },
                  });
                }}
              />
            }
          />
          {window.SETTINGS[SETTINGS_KEYS[7]] === CITIES[4].key &&
            <ListItem
              title={'Цвет метро'}
              onPress={() => {
                this.setState({
                  modalColorPicker: true,
                  colorSelection: {
                    color: settings.METRO_COLOR,
                    colorKey: 'METRO_COLOR',
                  },
                });
              }}
              rightIcon={
                <ColorCircle
                  color={settings.METRO_COLOR}
                  onPress={() => {
                    this.setState({
                      modalColorPicker: true,
                      colorSelection: {
                        color: settings.METRO_COLOR,
                        colorKey: 'METRO_COLOR',
                      },
                    });
                  }}
                />
              }
            />
          }
          <View style={{ paddingTop: 8, paddingBottom: 8 }}>
            <Button
              title={'Полное обновление'}
              style={{
                width: '100%',
              }}
              color={'#ff0000'}
              accessibilityLabel="Learn more about this purple button"
              onPress={() => {
                Alert.alert(
                  'Внимание',
                  'Текущее расписание будет перезаписано полностью новым, ты уверен? Сохраненные сотруться!',
                  [{ 
                    text: 'Обновить', 
                    onPress: () => {
                      if (window.isNeedUpdateApp) {
                        Alert.alert(
                          'Обновление недоступно',
                          'Обнови приложение до последней версии из App Store',
                            [{
                              text: 'Закрыть', 
                              onPress: () => {}, 
                              style: 'cancel',
                            }],
                          { 
                            cancelable: false,
                          },
                        );
    
                        return;
                      }

                      isNetworkConnected()
                        .then((isConnected) => {
                          if (isConnected) {
                            navigation.navigate(SCREEN_UPDATER, { recreate: true, getSettings: this.getSettings });
                          } else {
                            return Promise.reject();
                          }

                          return Promise.resolve();
                        }).catch(() => {
                          NoInternetConnection();
                        });
                    },
                  }, {
                    text: 'Отмена', 
                    onPress: () => {}, 
                    style: 'cancel',
                  }],
                  { 
                    cancelable: false,
                  },
                )
              }}
            />
          </View>
          <View style={{ paddingBottom: 8 }}>
            <Button
              title={'Обратная связь'}
              style={{
                width: '100%',
              }}
              onPress={() => {
                Linking.openURL('mailto:alexander.mozolevsky@gmail.com?subject=Предложения или ошибки Goes iOS');
              }}
            />
          </View>
        </ScrollView>
        <Modal
          animationType="slide"
          visible={this.state.modalColorPicker}
          transparent
        >
          <Fade delay={500} duration={200}>
            <View style={styles.modal__color}>
              <ColorPicker
                oldColor={colorSelection.color}
                onColorSelected={(color) => {
                  this.onSaveColor(color);
                }}
                onColorChange={(color) => {
                  clearTimeout(this.timerColorPicker);
                  this.timerColorPicker = setTimeout(() => {
                    this.setState({
                      colorSelection: {
                        ...colorSelection,
                        tempColor: fromHsv(color),
                      },
                    });
                  }, 300);
                }}
                style={{ flex: 1 }}
              />
              <View style={styles.modal__color__buttons}>
                <View style={{ flex: 1 }}>
                  <Button
                    title={'Отмена'}
                    style={{
                      flex: 1,
                      background: 'red',
                    }}
                    onPress={() => {
                      this.setState({
                        modalColorPicker: false,
                        colorSelection: {},
                      });
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title={'Сохранить'}
                    style={{
                      flex: 1,
                      background: 'green',
                    }}
                    onPress={() => {
                      this.onSaveColor();
                    }}
                  />
                </View>
              </View>
            </View>
          </Fade>
        </Modal>
      </Loader>
    );
  }
}

const ColorCircle = ({ color, onPress }: { color: string, onPress: Function }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
  >
    <View style={{ backgroundColor: color, width: 40, height: 40, borderRadius: 20 }} />
  </TouchableOpacity>
);


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
  modal__color: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: '#fff',
  },
  modal__color__buttons: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
});
