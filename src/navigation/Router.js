
/* 
* Routes 
* @module Navigation
* @flow  
*/

import React from 'react';
import { Actions, Router, Modal, Scene } from 'react-native-router-flux';
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
  SCREEN_FAVORITE_STOP,
  SCREEN_FAVORITE_DIRECTION,
  SCREEN_SETTINGS, 
  SCREEN_UPDATER,
  SCREEN_SCHEDULE,
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

import { DEFAULT_SETTINGS, SETTINGS_KEYS } from '../constants/config';


const SettingsRightButton = () => (
  <TouchableOpacity 
    activeOpacity={0.8} 
    onPress={() => Actions[SCREEN_SETTINGS]()}
    style={{ marginRight: 16 }}
  >
    <FontAwesome name={'cog'} size={20} color={'#fff'} />
  </TouchableOpacity> 
);

const ChangeDirectionRightButton = ({ reverseDirection }: { reverseDirection: Object}) => (
  reverseDirection ? (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={() => {
        EventEmitter.emit('change__direction');
      }}
      style={{ marginRight: 16 }}
    >
      <FontAwesome name={'exchange'} size={20} color={'#fff'} />
    </TouchableOpacity>) : 
    null 
);

const CommonProps = ({
  navigationBarStyle: () => ({
    backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
  }),
  titleStyle: ({
    color: 'white',
  }),
  navBarButtonColor: '#fff',
  backButtonTintColor: '#fff',
});

export const Routes = () => (
  <Router>
    <Modal hideNavBar>
      <Scene key="root" hideTabBar>
        <Scene 
          key={SCREEN_SPLASH}
          component={Splash}
          hideNavBar
          hideTabBar
          initial
        />
        <Scene 
          key={SCREEN_CITY_SELECTOR}
          hideTabBar
          hideNavBar
          component={CitySelector}
          {...CommonProps}
        />
        <Scene 
          key={SCREEN_MAIN}
          tabs
          back={false}
          renderRightButton={SettingsRightButton}
          activeTintColor={DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
          inactiveTintColor={'#000'}
          {...CommonProps}
          hideNavBar
        >
          <Scene
            key={SCREEN_STOPS}
            initial
            title='Остановки'
            icon={({ focused }) => (
              <Ionicons
                name='ios-git-branch'
                size={24}
                color={!focused ? '#000' : DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
              />
            )}
            {...CommonProps}
          >
            <Scene 
              component={Stops}
              {...CommonProps}
              panHandlers={null}
              initial
            />
            <Scene 
              key={SCREEN_STOP_DIRECTIONS}
              title={({ title }) => title}
              component={StopDirections}
              renderRightButton={null}
              backTitle={' '}
              {...CommonProps}
            />
          </Scene>
          <Scene
            key={SCREEN_DIRECTIONS}
            title='Маршруты'
            icon={({ focused }) => (
              <Ionicons
                name='ios-bus-outline'
                size={24}
                color={!focused ? '#000' : DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
              />
            )}
            {...CommonProps}
          >
            <Scene 
              component={Directions}
              {...CommonProps}
              panHandlers={null}
              initial
            />
            <Scene 
              key={SCREEN_DIRECTION_STOPS}
              title={({ title }) => title}
              component={DirectionStops}
              renderRightButton={ChangeDirectionRightButton}
              backTitle={' '}
              {...CommonProps}
            />
          </Scene>

          <Scene
            key={SCREEN_FAVORITES}
            title='Сохраненные'
            icon={({ focused }) => (
              <Ionicons
                name='ios-star-outline'
                size={24}
                color={!focused ? '#000' : DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
              />
            )}
            {...CommonProps}
          >
            <Scene 
              component={Favorites}
              {...CommonProps}
              panHandlers={null}
              initial
            />
            <Scene 
              key={SCREEN_FAVORITE_DIRECTION}
              title={({ title }) => title}
              component={DirectionStops}
              renderRightButton={null}
              backTitle={' '}
              {...CommonProps}
            />
            <Scene 
              key={SCREEN_FAVORITE_STOP}
              title={({ title }) => title}
              component={StopDirections}
              renderRightButton={null}
              backTitle={' '}
              {...CommonProps}
            />
          </Scene>
        </Scene>
        <Scene 
          key={SCREEN_UPDATER}
          hideNavBar
          panHandlers={null}
          component={Updater}
          {...CommonProps}
        />
        <Scene
          key={SCREEN_SETTINGS}
          hideNavBar
          back
        >
          <Scene 
            title='Настройки'
            component={Settings}
            {...CommonProps}
            initial
            hideNavBar={false}
          />
        </Scene>
      </Scene>
      <Scene 
        key={SCREEN_SCHEDULE} 
        component={Schedule} 
        title={({ in: titleIn }) => titleIn}
        hideNavBar={false}
        {...CommonProps}
      />
    </Modal>
  </Router>
);