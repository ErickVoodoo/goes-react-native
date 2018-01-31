
/* 
* Routes 
* @module Navigation
* @flow  
*/

import React from 'react';
import { StackNavigator, TabNavigator, DrawerNavigator } from 'react-navigation';

import { TouchableOpacity } from 'react-native';
import EventEmitter from 'react-native-eventemitter';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { 
  SCREEN_SPLASH, 
  SCREEN_CITY_SELECTOR,
  SCREEN_MAIN, 
  SCREEN_STOPS, 
  SCREEN_STOP_DIRECTIONS,
  SCREEN_DIRECTIONS, 
  SCREEN_DIRECTION_STOPS,
  SCREEN_FAVORITES,
  SCREEN_SETTINGS, 
  SCREEN_UPDATER,
  SCREEN_SCHEDULE,
  SCREEN_MAP,
  SCREEN_DRAWER,
  SCREEN_IAP,
  // SCREEN_INTRO,
} from '../constants/routes';

import { Splash } from '../screens/Splash';
import { CitySelector } from '../screens/CitySelector';
import { DirectionStops } from '../screens/Directions/Stops';
import { StopDirections } from '../screens/Stops/Directions';
import { Schedule } from '../screens/Schedule';
import { Directions } from '../screens/Directions';
import { Stops } from '../screens/Stops';
import { Favorites } from '../screens/Favorites';
import { Settings } from '../screens/Settings';
import { Updater } from '../screens/Updater';
import { MapContainer } from '../screens/Map';
import { IapContainer } from '../screens/Iap';
import { SideMenu } from './SideMenu';

import { DEFAULT_SETTINGS, SETTINGS_KEYS } from '../constants/config';

const SettingsRightButton = ({ navigation }: { navigation: Object }) => (
  <TouchableOpacity 
    activeOpacity={0.6} 
    onPress={() => navigation.navigate(SCREEN_SETTINGS)}
    style={{ paddingHorizontal: 16, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <FontAwesome name={'cog'} size={20} color={'#fff'} />
  </TouchableOpacity> 
);

const IapRightButton = ({ navigation }: { navigation: Object }) => (
  <TouchableOpacity 
    activeOpacity={0.6} 
    onPress={() => navigation.navigate(SCREEN_IAP)}
    style={{ paddingHorizontal: 16, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <FontAwesome name={'cart-plus'} size={24} color={'#fff'} />
  </TouchableOpacity> 
);

const ChangeDirectionRightButton = ({ reverseDirection }: { reverseDirection: Object}) => (
  reverseDirection ? (
    <TouchableOpacity 
      activeOpacity={0.6} 
      onPress={() => {
        EventEmitter.emit('change__direction');
      }}
      style={{ paddingHorizontal: 16, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <FontAwesome name={'exchange'} size={20} color={'#fff'} />
    </TouchableOpacity>) : 
    null 
);

const IapFree = () => (
  <TouchableOpacity 
    activeOpacity={0.6} 
    onPress={() => {
      EventEmitter.emit('iap_free');
    }}
    style={{ paddingHorizontal: 16, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <FontAwesome name={'diamond'} size={20} color={'#fff'} />
  </TouchableOpacity>
);

const commonProps = ({
  headerTintColor: '#fff',
  headerBackTitle: '',
});

const Tabs = TabNavigator({
  [SCREEN_STOPS]: {
    screen: Stops,
    navigationOptions: () => ({
      title: 'Остановки',
      tabBarLabel: 'Остановки',
      tabBarIcon: ({ focused }: { focused: boolean }) => (
        <Ionicons
          name='ios-git-branch'
          size={24}
          color={!focused ? '#000' : DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
        />
      ),
      headerStyle: {
        backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
      },
      ...commonProps,
    }),
  },
  [SCREEN_DIRECTIONS]: {
    screen: Directions,
    navigationOptions: () => ({
      title: 'Маршруты',
      tabBarLabel: 'Маршруты',
      tabBarIcon: ({ focused }: { focused: boolean }) => (
        <Ionicons
          name='ios-bus-outline'
          size={24}
          color={!focused ? '#000' : DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
        />
      ),
      headerStyle: {
        backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
      },
      ...commonProps,
    }),
  },
  [SCREEN_FAVORITES]: {
    screen: Favorites,
    navigationOptions: () => ({
      title: 'Сохраненные',
      tabBarLabel: 'Сохраненные',
      tabBarIcon: ({ focused }: { focused: boolean }) => (
        <Ionicons
          name='ios-star-outline'
          size={24}
          color={!focused ? '#000' : DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
        />
      ),
      headerStyle: {
        backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
      },
      ...commonProps,
    }),
  },
}, {
  tabBarPosition: 'bottom',
  animationEnabled: true,
  tabBarOptions: {
    activeTintColor: DEFAULT_SETTINGS[SETTINGS_KEYS[0]],
  },
  swipeEnabled: false,
  backBehavior: 'initialRoute',
});


const DrawerNav = DrawerNavigator({
  [SCREEN_MAIN]: {
    screen: Tabs,
    navigationOptions: {
      title: 'Главная',
      ...commonProps,
    },
  },
  [SCREEN_MAP]: {
    screen: MapContainer,
    navigationOptions: () => ({
      title: 'Карта',
      headerStyle: {
        backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
      },
      ...commonProps,
    }),
  },
}, {
  contentComponent: SideMenu,
});

export const RootNavigator = StackNavigator({
  [SCREEN_SPLASH]: {
    screen: Splash,
    navigationOptions: {
      header: null,
    },
  },
  [SCREEN_CITY_SELECTOR]: {
    screen: CitySelector,
    navigationOptions: {
      header: null,
    },
  },
  [SCREEN_DRAWER]: {
    screen: DrawerNav,
    navigationOptions: ({ navigation }) => ({
      headerLeft: (
        <TouchableOpacity 
          onPress={() => navigation.navigate('DrawerToggle')}
          style={{
            marginLeft: 16,
          }}
        >
          <FontAwesome name={'bars'} size={24} color={'#fff'} />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
      },
      headerRight: <SettingsRightButton navigation={navigation} />,
      ...commonProps,
    }), 
  },
  [SCREEN_STOP_DIRECTIONS]: {
    screen: StopDirections,
    navigationOptions: ({ navigation }) => ({
      title: navigation.state.params.title,
      headerStyle: {
        backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
      },
      ...commonProps,
    }),
  },
  [SCREEN_DIRECTION_STOPS]: {
    screen: DirectionStops,
    navigationOptions: ({ navigation }) => ({
      headerRight: <ChangeDirectionRightButton reverseDirection={navigation.state.params.reverseDirection} />,
      title: navigation.state.params.title,
      headerStyle: {
        backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
      },
      ...commonProps,
    }),
  },
  [SCREEN_UPDATER]: {
    screen: Updater,
    navigationOptions: {
      header: null,
      gesturesEnabled: false,
    },
  },
  [SCREEN_SETTINGS]: {
    screen: Settings,
    navigationOptions: ({ navigation }) => ({
      title: 'Настройки',
      headerStyle: {
        backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
      },
      headerRight: <IapRightButton navigation={navigation} />,
      ...commonProps,
    }),
  },
  [SCREEN_IAP]: {
    screen: IapContainer,
    navigationOptions: () => ({
      title: 'Покупки',
      headerStyle: {
        backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
      },
      headerRight: <IapFree />, 
      ...commonProps,
    }),
  },
  [SCREEN_SCHEDULE]: {
    screen: Schedule,
    navigationOptions: ({ navigation }) => ({
      title: navigation.state.params.in,
      headerStyle: {
        backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
      },
      ...commonProps,
    }),
  },
});