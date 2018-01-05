/* 
* SideMenu 
* @module Navigation 
* @flow  
*/

import React from 'react';
import styled from 'styled-components/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Actions } from 'react-native-router-flux';
import { SCREEN_MAP, SCREEN_STOPS } from '../constants/routes';
import { Flex } from '../components';

const MenuPointContainer = styled.View`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  height: 50px;
  background: #f6f6f6;
  padding: 0px 10px;
`;

const MenuPointText = styled.Text`
  flex: 1;
  font-size: 16px;
  color: #a6a6a6;
  margin-left: 16px;
`;

const MenuPoint = ({ icon, text, onPress }) => (
  <MenuPointContainer>
    {icon}
    <MenuPointText onPress={onPress}>{text}</MenuPointText>
  </MenuPointContainer>
);

export const SideMenu = () => (
  <Flex column size={1} align={'center'} justify={'center'}>
    <MenuPoint 
      icon={<FontAwesome name={'angellist'} size={20} color={'#a6a6a6'} />}
      text={'Главная'}
      onPress={() => Actions.push(SCREEN_STOPS)}
    />
    <MenuPoint 
      icon={<FontAwesome name={'map-o'} size={20} color={'#a6a6a6'} />}
      text={'Карта'}
      onPress={() => Actions.push(SCREEN_MAP)}
    />
  </Flex>
);