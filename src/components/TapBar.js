/* 
* TapBar 
* @module Components 
* @flow  
*/

import React from 'react';
import { ViewPropTypes, StyleSheet, Text, View, Animated } from 'react-native';
import PropTypes from 'prop-types';

import { SETTINGS_KEYS } from '../constants/config';
import Colors from '../constants/colors';
import { Button } from './Button';

export class TapBar extends React.Component {
  renderTab = (name, page, isTabActive, onPressHandler) => {
    const { activeTextColor, inactiveTextColor, textStyle, tabs } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    // const fontWeight = isTabActive ? 'bold' : 'normal';
    const MAIN_APPLICATION_COLOR = window.SETTINGS[SETTINGS_KEYS[0]];

    return (
      <Button
        style={styles.flexOne}
        key={name}
        accessible
        accessibilityLabel={name}
        accessibilityTraits='button'
        onPress={() => onPressHandler(page)}
      >
        <View style={[styles.tab, this.props.tabStyle ]}>
          <Text style={[{ color: MAIN_APPLICATION_COLOR || textColor, }, textStyle, { fontSize: tabs.length === 4 ? 12 : 14 }]}>
            {name}
          </Text>
        </View>
      </Button>
    );
  }

  render() {
    const containerWidth = this.props.containerWidth;
    const numberOfTabs = this.props.tabs.length;

    const MAIN_APPLICATION_COLOR = window.SETTINGS[SETTINGS_KEYS[0]];

    const tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs,
      height: 2,
      backgroundColor: MAIN_APPLICATION_COLOR,
      bottom: 0,
    };

    const left = {
      transform: [
        {
          translateX: this.props.scrollValue.interpolate({
            inputRange: [0, 1,],
            outputRange: [0, containerWidth / numberOfTabs,],
          })
        }
      ]
    }

    return (
      <View style={[styles.tabs, { backgroundColor: this.props.backgroundColor }, this.props.style ]}>
        {this.props.tabs.map((name, page) => {
          const isTabActive = this.props.activeTab === page;
          const renderTab = this.props.renderTab || this.renderTab;
          return renderTab(name, page, isTabActive, this.props.goToPage);
        })}
        <Animated.View style={[ tabUnderlineStyle, left, this.props.underlineStyle ]} />
      </View>
    );
  }
}

TapBar.propTypes = {
  goToPage: PropTypes.func,
  activeTab: PropTypes.number,
  tabs: PropTypes.array,
  containerWidth: PropTypes.number,
  backgroundColor: PropTypes.string,
  activeTextColor: PropTypes.string,
  inactiveTextColor: PropTypes.string,
  textStyle: Text.propTypes.style,
  tabStyle: ViewPropTypes.style,
  renderTab: PropTypes.func,
  underlineStyle: ViewPropTypes.style,
};

TapBar.defaultProps = {
  activeTextColor: Colors.tabIconSelected,
  inactiveTextColor: Colors.tabIconSelected,
  backgroundColor: null,
};

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  flexOne: {
    flex: 1,
    width: 100,
  },
  tabs: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: Colors.tabIconDefault,
  },
});
