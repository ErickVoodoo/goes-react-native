/* 
* Config 
* @module Constants 
* @flow  
*/

import Colors from './colors';

export const CITIES: Array<Object> = [{
  city: 'Брест',
  key: 'brest',
}, {
  city: 'Витебск',
  key: 'vitebsk',
}, {
  city: 'Гомель',
  key: 'gomel',
}, {
  city: 'Гродно',
  key: 'grodno',
}, {
  city: 'Минск',
  key: 'minsk',
}, {
  city: 'Могилев',
  key: 'mogilev',
}];

export const API_URL: Function = (city: string = CITIES[0].key): string => `https://euanpa.ru/${city}/api/`;

export const API_KEY: string = 'temp_key';

export const DATABASE_NAME: string = 'goes_db';

export const SETTINGS_KEYS: Array<string> = [
  'MAIN_APPLICATION_COLOR', // 0
  'BUS_COLOR', // 1
  'TROLL_COLOR', // 2
  'TRAMM_COLOR', // 3
  'METRO_COLOR', // 4
  'SCHEDULE_VERSION', // 5
  'SCHEDULE_AUTOUPDATE', // 6
  'SCHEDULE_CITY', // 7
  'APP_VERSION', // 8
  'INTRO_WAS_VIEWED', // 9
  'APPLICATION_VERSION', // 10
];

export const DEFAULT_SETTINGS: Object = {
  [SETTINGS_KEYS[0]]: Colors.tintColor,
  [SETTINGS_KEYS[1]]: Colors.busColor,
  [SETTINGS_KEYS[2]]: Colors.trolleyColor,
  [SETTINGS_KEYS[3]]: Colors.trammColor,
  [SETTINGS_KEYS[4]]: Colors.metroColor,
  [SETTINGS_KEYS[5]]: '0',
  [SETTINGS_KEYS[6]]: '1', // 1 = true
  [SETTINGS_KEYS[7]]: CITIES[5].city,
  [SETTINGS_KEYS[8]]: '0.0.1',
  [SETTINGS_KEYS[9]]: '1',
  [SETTINGS_KEYS[10]]: '10000', 
};

export const ANALYTIC_PAGES: Object = {
  CITY_SELECTOR: 'CITY_SELECTOR',
  STOPS: 'STOPS',
  DIRECTIONS: 'DIRECTIONS',
  FAVORITES: 'FAVORITES',
  SCHEDULE: 'SCHEDULE',
  SETTINGS: 'SETTINGS',
  STOPS_ITEMS: 'STOPS_ITEMS',
  DIRECTIONS_ITEMS: 'DIRECTIONS_ITEMS',
};

export const ANALYTIC_EVENTS: Object = {
  HARD_UPDATE: 'HARD_UPDATE',
  CHANGE_CITY: 'CHANGE_CITY',
  SET_AUTOUPDATE: 'SET_AUTOUPDATE',
  SCHEDULE_DIRECTION: 'SCHEDULE_DIRECTION',
  SCHEDULE_STOP: 'SCHEDULE_STOP',
  SCHEDULE_DAY: 'SCHEDULE_DAY',
}
