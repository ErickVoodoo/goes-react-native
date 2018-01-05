
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
import { DEFAULT_SETTINGS, SETTINGS_KEYS } from '../constants/config';
import { SideMenu } from './SideMenu';

const SettingsRightButton = ({ navigation }: { navigation: Object }) => (
  <TouchableOpacity 
    activeOpacity={0.8} 
    onPress={() => navigation.navigate(SCREEN_SETTINGS)}
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

const commonProps = ({
  headerTintColor: '#fff',
  headerBackTitle: '',
});

const Tabs = TabNavigator({
  [SCREEN_STOPS]: {
    screen: Stops,
    navigationOptions: ({ navigation }) => ({
      title: 'Остановки',
      tabBarLabel: 'Остановки',
      tabBarIcon: ({ focused }: { focused: boolean }) => (
        <Ionicons
          name='ios-git-branch'
          size={24}
          color={!focused ? '#000' : DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
        />
      ),
      headerRight: <SettingsRightButton navigation={navigation} />,
      headerStyle: {
        backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
      },
      ...commonProps,
    }),
  },
  [SCREEN_DIRECTIONS]: {
    screen: Directions,
    navigationOptions: ({ navigation }) => ({
      title: 'Маршруты',
      tabBarLabel: 'Маршруты',
      tabBarIcon: ({ focused }: { focused: boolean }) => (
        <Ionicons
          name='ios-bus-outline'
          size={24}
          color={!focused ? '#000' : DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
        />
      ),
      headerRight: <SettingsRightButton navigation={navigation} />,
      headerStyle: {
        backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
      },
      ...commonProps,
    }),
  },
  [SCREEN_FAVORITES]: {
    screen: Favorites,
    navigationOptions: ({ navigation }) => ({
      title: 'Сохраненные',
      tabBarLabel: 'Сохраненные',
      tabBarIcon: ({ focused }: { focused: boolean }) => (
        <Ionicons
          name='ios-star-outline'
          size={24}
          color={!focused ? '#000' : DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
        />
      ),
      headerRight: <SettingsRightButton navigation={navigation} />,
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
    navigationOptions: () => ({
      title: 'Настройки',
      headerStyle: {
        backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]],
      },
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

// export const Routes = () => (
//   <Router>
//     <Modal hideNavBar>
//       <Scene key="root" hideTabBar>
//         <Scene 
//           key={SCREEN_SPLASH}
//           component={Splash}
//           hideNavBar
//           hideTabBar
//           initial
//         />
//         <Scene 
//           key={SCREEN_CITY_SELECTOR}
//           hideTabBar
//           hideNavBar
//           component={CitySelector}
//           {...CommonProps}
//         />
//         <Scene 
//           key="drawer" 
//           drawer 
//           contentComponent={SideMenu}
//           drawerIcon={<FontAwesome name={'bars'} size={24} color={'#fff'} />}
//           open={false}
//           hideNavBar
//         >
//           <Scene 
//             tabs
//             key={SCREEN_MAIN}
//             back={false}
//             renderRightButton={SettingsRightButton}
//             activeTintColor={DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
//             inactiveTintColor={'#000'}
//             {...CommonProps}
//             hideNavBar
//           >
//             <Scene
//               key={SCREEN_STOPS}
//               initial
//               title='Остановки'
//               icon={({ focused }) => (
//                 <Ionicons
//                   name='ios-git-branch'
//                   size={24}
//                   color={!focused ? '#000' : DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
//                 />
//               )}
//               {...CommonProps}
//             >
//               <Scene 
//                 component={Stops}
//                 {...CommonProps}
//                 panHandlers={null}
//                 initial
//               />
//               <Scene 
//                 key={SCREEN_STOP_DIRECTIONS}
//                 title={({ title }) => title}
//                 component={StopDirections}
//                 renderRightButton={null}
//                 backTitle={' '}
//                 {...CommonProps}
//                 back
//               />
//             </Scene>
//             <Scene
//               key={SCREEN_DIRECTIONS}
//               title='Маршруты'
//               icon={({ focused }) => (
//                 <Ionicons
//                   name='ios-bus-outline'
//                   size={24}
//                   color={!focused ? '#000' : DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
//                 />
//               )}
//               {...CommonProps}
//             >
//               <Scene 
//                 component={Directions}
//                 {...CommonProps}
//                 panHandlers={null}
//                 initial
//               />
//               <Scene 
//                 key={SCREEN_DIRECTION_STOPS}
//                 title={({ title }) => title}
//                 component={DirectionStops}
//                 renderRightButton={ChangeDirectionRightButton}
//                 backTitle={' '}
//                 {...CommonProps}
//                 back
//               />
//             </Scene>

//             <Scene
//               key={SCREEN_FAVORITES}
//               title='Сохраненные'
//               icon={({ focused }) => (
//                 <Ionicons
//                   name='ios-star-outline'
//                   size={24}
//                   color={!focused ? '#000' : DEFAULT_SETTINGS[SETTINGS_KEYS[0]]}
//                 />
//               )}
//               {...CommonProps}
//             >
//               <Scene 
//                 component={Favorites}
//                 {...CommonProps}
//                 panHandlers={null}
//                 initial
//               />
//               <Scene 
//                 key={SCREEN_FAVORITE_DIRECTION}
//                 title={({ title }) => title}
//                 component={DirectionStops}
//                 renderRightButton={null}
//                 backTitle={' '}
//                 {...CommonProps}
//                 back
//               />
//               <Scene 
//                 key={SCREEN_FAVORITE_STOP}
//                 title={({ title }) => title}
//                 component={StopDirections}
//                 renderRightButton={null}
//                 backTitle={' '}
//                 {...CommonProps}
//               />
//             </Scene>
//           </Scene>
//         </Scene>
//         <Scene
//           key={SCREEN_MAP}
//           {...CommonProps}
//           back
//           hideNavBar
//         >
//           <Scene 
//             component={MapContainer}
//             {...CommonProps}
//             title='Карта'
//             initial
//             back
//             hideNavBar={false}
//           />
//         </Scene>
//         <Scene 
//           key={SCREEN_UPDATER}
//           hideNavBar
//           panHandlers={null}
//           component={Updater}
//           {...CommonProps}
//         />
//         <Scene
//           key={SCREEN_SETTINGS}
//           hideNavBar
//           back
//         >
//           <Scene 
//             title='Настройки'
//             component={Settings}
//             {...CommonProps}
//             initial
//             hideNavBar={false}
//           />
//         </Scene>
//       </Scene>
//       <Scene 
//         key={SCREEN_SCHEDULE} 
//         component={Schedule} 
//         title={({ in: titleIn }) => titleIn}
//         hideNavBar={false}
//         {...CommonProps}
//       />
//     </Modal>
//   </Router>
// );