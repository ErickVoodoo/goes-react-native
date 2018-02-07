/* 
* Container 
* @module Screens/Splash 
* @flow  
*/

import { compose, lifecycle, withProps, withHandlers, withState } from 'recompose';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import NaturalSort from 'javascript-natural-sort';
import { GoogleAnalyticsTracker } from 'react-native-google-analytics-bridge';
import SQLite from 'react-native-sqlite-storage';
import { Animated } from 'react-native'; 
// import PushNotification from 'react-native-push-notification';

import { isNetworkConnected } from '../../utilities/request';
import { Screen } from './View';

import { DATABASE_NAME, SETTINGS_KEYS, DEFAULT_SETTINGS, ANALYTIC_PAGES, ANALYTIC_EVENTS } from '../../constants/config';
import { setSettings as actionSetSettings } from '../../store/actions/settings';
import { DBHelper } from '../../utilities/db';
import { replaceWith } from '../../utilities/common';
import { SCREEN_DRAWER, SCREEN_CITY_SELECTOR } from '../../constants/routes';

const mapDispatchToProps = dispatch => 
  bindActionCreators({
    setSettings: actionSetSettings,
  }, dispatch);

SQLite.enablePromise(false);

export const Splash = compose(
  connect(null, mapDispatchToProps),
  withState('backgroundAnimation', 'set', new Animated.Value(0.8)),
  withState('iconAnimation', 'set', new Animated.Value(0)),
  withProps({
    setUtils: () => {
      window.LOGGER = (title, ...rest) => {
        console.log(`------${title}------`);
  
        rest.forEach((obj) => {
          console.log(typeof obj === 'object' ? JSON.stringify(obj) : obj);
        });
  
        console.log('-'.repeat(title.length + 12));
      }
  
      window.DESC = (obj) => {
        console.log(JSON.stringify(Object.keys(obj)));
      }
  
      window.compareNumbers = (a, b) => {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
  
        return 0;
      };
  
      window.NaturalSort = NaturalSort;
    },
    setDatabase: ({ onReady }) => {
      const db = SQLite.openDatabase(DATABASE_NAME, '1.0', 'Test Database', 200000, onReady);

      window.DB = new DBHelper(db);
    },
    setAnalytic: () => {
      const analytics = new GoogleAnalyticsTracker('UA-107698240-1');
  
      window.ANALYTIC = {
        page: (page) => {
          window.LOGGER('PAGE ANALYTIC', page);
          isNetworkConnected()
            .then((isConnected) => {
              if (isConnected) {
                analytics.trackScreenView(page);
              }
            });
        },
        event: (...rest) => {
          window.LOGGER('EVENT ANALYTIC', ...rest);
          isNetworkConnected()
            .then((isConnected) => {
              if (isConnected) {
                analytics.trackEvent(...rest);
              }
            });
        },
      };
  
      window.ANALYTIC_EVENTS = ANALYTIC_EVENTS;
      window.ANALYTIC_PAGES = ANALYTIC_PAGES;
    },
  }),
  withHandlers({
    prepareApp: ({ setSettings, navigation, ...props }) => () => {
      window.DB.createDatabase()
        .then(() => 
          window.DB.update({
            table: 'settings',
            values: {
              value: DEFAULT_SETTINGS[SETTINGS_KEYS[10]],
            },
            where: {
              key: SETTINGS_KEYS[10],
            },
          }),
        )
        .then(() => 
          window.DB.select({
            table: 'iap',
          }),
        )
        .then((iap = []) => {
          window.IAP = iap;
          return Promise.resolve();
        })
        .then(() =>
          window.DB.select({
            table: 'settings',
          }),
        )
        .then((settings) => {
          setSettings({ payload: settings });
          window.SETTINGS = settings.reduce((total, next) => {
            const temp = total;
            temp[next.key] = next.value;

            return temp;
          }, {});
          
          return window.DB.select({
            table: 'meta',
          });
        })
        .then((meta) => {
          setTimeout(() => {
            if (meta && meta.length) {
              navigation.dispatch(replaceWith(SCREEN_DRAWER, ({ settings: window.SETTINGS })));
            } else {
              navigation.dispatch(replaceWith(SCREEN_CITY_SELECTOR, ({ settings: window.SETTINGS })));
            }
          }, 2000)

          // PushNotification.localNotificationSchedule({
          //   message: 'My Notification Message', // (required)
          //   date: new Date(Date.now() + (10 * 1000)) // in 60 secs
          // });
        });
    },
  }),
  lifecycle({
    componentWillMount() {
      const { setUtils, setDatabase, setAnalytic, prepareApp } = this.props;
      setUtils();
      setDatabase({ onReady: prepareApp });
      setAnalytic();
    },
    componentDidMount() {
      const { backgroundAnimation, iconAnimation } = this.props;

      Animated.loop(
        Animated.sequence([
          Animated.timing(backgroundAnimation, {
            toValue: 1,
            duration: 500,
          }),
          Animated.timing(backgroundAnimation, {
            toValue: 0.8,
            duration: 500,
          }),
        ]),
        {
          iterations: 10,
        },
      ).start();
      
      Animated.timing(iconAnimation, {
        toValue: 1,
        duration: 1000,
      }).start();
    },
  }),
)(Screen);