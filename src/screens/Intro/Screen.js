/* 
* Screen 
* @module Screens/Intro 
* @flow  
*/

import React from 'react';
import AppIntroSlider from 'react-native-app-intro-slider';
import { View, Text, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';

import { SETTINGS_KEYS } from '../../constants/config';
import Colors from '../../constants/colors';

import { SCREEN_STOPS } from '../../constants/routes';

export class Screen extends React.Component {
  onDoneHandle = () => {
    window.DB.update({ 
      table: 'settings', 
      values: { 
        value: 1,
      }, 
      where: { 
        key: SETTINGS_KEYS[9],
      },
    })
      .then(() => {
        Actions[SCREEN_STOPS]();
      });
  }

  renderItem = props => (
    <LinearGradient
      style={[styles.mainContent, {
        paddingTop: props.topSpacer,
        paddingBottom: props.bottomSpacer,
      }]}
      colors={props.colors}
      start={{ x: 0, y: 0.1 }} 
      end={{ x: 0.1, y: 1 }}
    >
      <Video
        level={5}
        source={props.video}
        rate={1.0}
        volume={1.0}
        muted={false}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={props.videoStyles}
      />
      <View>
        <Text style={styles.title}>{props.title}</Text>
        <Text style={styles.text}>{props.text}</Text>
      </View>
    </LinearGradient>
  );

  render() {
    const slides = [
      {
        key: 'some-1',
        title: 'Сохраняй нужное',
        text: 'Можно сохранять остановки и маршруты \n В маршрутах добавлять через долгое удерживание',
        video: require('../../../assets/intro-1.mp4'),
        videoStyles: { width: 300, height: 300 },
        colors: ['#63E2FF', '#B066FE'],
      },
      {
        key: 'some-2',
        title: 'Удаляй ненужное',
        text: 'Удалять таким же образом как и добавлять \n В маршрутах удалять тоже через долгое удердживание',
        video: require('../../../assets/intro-2.mp4'),
        videoStyles: { width: 300, height: 300 },
        colors: ['#A3A1FF', '#3A3897'],
      },
      {
        key: 'some-3',
        title: 'Очищай сохраненные',
        text: 'Для всех сохраненных - долгое удерживание',
        video: require('../../../assets/intro-3.mp4'),
        videoStyles: { width: 300, height: 300 },
        colors: ['#29ABE2', '#4F00BC'],
      },
      {
        key: 'some-4',
        title: 'Кастомизируй',
        text: 'Ты можешь изменять цвет приложения и транспорта',
        video: require('../../../assets/intro-4.mp4'),
        videoStyles: { width: 300, height: 300 },
        colors: ['#A3A1FF', '#B066FE'],
      },
    ];

    return (
      <AppIntroSlider
        slides={slides}
        renderItem={this.renderItem}
        onDone={this.onDoneHandle}
      />
    );
  }
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  image: {
    width: 320,
    height: 320,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'transparent',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    color: 'white',
    backgroundColor: 'transparent',
    textAlign: 'center',
    marginBottom: 16,
  }
});
