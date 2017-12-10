import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

type IProps = {
  children: Object;
  containerStyle: Object;
  textStyle: Object;
  onPress: Function;
  rightIcon: Object;
  leftIcon: Object;
};

export const ContainerText = ({
  children,
  containerStyle,
  textStyle,
  onPress,
  rightIcon = null,
  leftIcon = null,
}: IProps) => (
  <View style={[styles.container, containerStyle]}>
    {leftIcon}
    <View style={[styles.container__text, rightIcon || leftIcon ? { alignItems: 'flex-start' } : {}]}>
      <Text style={[styles.text, textStyle]} onPress={onPress}>
        {children}
      </Text>
    </View>
    {rightIcon}
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 4,
    maxHeight: 52,
    // backgroundColor: 'red'
  },
  container__text: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    // backgroundColor: 'green'
  },
  text: {
    padding: 4,
    // backgroundColor: 'blue'
  },
});
