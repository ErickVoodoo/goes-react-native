/* 
* SideMenu 
* @module Navigation 
* @flow  
*/

import React from 'react';
import { lifecycle, compose, withState, withHandlers } from 'recompose';
import { isNil } from 'lodash';
import EventEmitter from 'react-native-eventemitter';
import styled from 'styled-components/native';
import { ScrollView, FlatList } from 'react-native';
import { DrawerItems, SafeAreaView } from 'react-navigation';
import { ListItem } from 'react-native-elements';
import { Flex, TransportIcon, NextTransport } from '../components';
import { SETTINGS_KEYS } from '../constants/config';
import { SCREEN_SCHEDULE } from '../constants/routes';
import { getNextTime, makeTimeToReadableFormat } from '../utilities/time';

const ScheduleTime = styled(Flex)`
  padding: 12px 0px;
  flex: 1;
`;

const Title = styled.Text`
  font-size: 14px;
  text-align: center;
  padding: 8px 0px;
`;

const NoItems = styled.Text`
  font-size: 14px;
  text-align: center;
  font-style: italic;
  padding: 8px 0px;
`;

const Screen = ({ favoriteStops, navigation, ...props }) => (
  <ScrollView>
    <SafeAreaView forceInset={{ top: 'always', horizontal: 'never' }}>
      <Flex column>
        <DrawerItems 
          {...props} 
          navigation={navigation}
          activeBackgroundColor={window.SETTINGS[SETTINGS_KEYS[0]]}
          activeTintColor={'#fff'}
        />
        <ScheduleTime>
          <Title>Расписание</Title>
          { favoriteStops.length ?
            <FlatList
              data={favoriteStops}
              style={{
                borderTopColor: '#a6a6a6',
                borderTopWidth: 1,
              }}
              renderItem={({ item: { key, s_id, d_id, stop, direction, transport, type, tms, r_id, ...other } }) => {
                const nextPrev = getNextTime(tms);

                return (
                  <ListItem
                    key={key}
                    title={direction}
                    subtitle={stop}
                    titleStyle={{ fontSize: 12 }}
                    subtitleStyle={{ fontSize: 10 }}
                    leftIcon={<TransportIcon small number={transport} type={type} />}
                    badge={nextPrev ? { element: <NextTransport small minutes={nextPrev.minutes} time={nextPrev.time} /> } : null}
                    onPress={() => {
                      const params = {
                        s_id,
                        d_id,
                        r_id,
                        stop,
                        direction,
                        type,
                        transport,
                      };

                      navigation.navigate(SCREEN_SCHEDULE, {
                        item: {
                          ...params,
                          currentDirection: {
                            ...other,
                            ...params,
                            id: d_id,
                          },
                        },
                        in: nextPrev && !isNil(nextPrev.minutes) ? `Через ${makeTimeToReadableFormat(nextPrev.minutes)}` : null,
                      });
                    }}
                  />
                );
              }}
              keyExtractor={item => item.key}
            /> :
            <NoItems>
              Нет сохраненных
            </NoItems>
          }
        </ScheduleTime>
      </Flex>
    </SafeAreaView>
  </ScrollView>
);

this.timer = null;

export const SideMenu = compose(
  withState('favoriteStops', 'setFavoriteStops', []),
  withHandlers({
    reloadFavorites: ({ setFavoriteStops }) => () => {
      window.DB.select({
        table: 'schedule',
      })
        .then((items) => {
          Promise.all([
            ...items.map(({ d_id, s_id }) => 
              window.DB.query({
                sql: `
                  SELECT *
                  FROM times
                  WHERE d_id=${d_id} AND id_s=${s_id}`,
              }), 
            ),
          ])
            .then((times) => {
              const transformTimes = times.map(item => item[0]);

              const prepareItems = items.map(({ s_id, d_id, ...item }) => ({
                ...item,
                s_id, 
                d_id,
                ...transformTimes.find(({ id_s, d_id: tD_id }) => id_s === s_id && tD_id === d_id),
                key: `${s_id}_${d_id}`,
              }));

              setFavoriteStops(prepareItems.sort((a, b) => window.NaturalSort(a.transport, b.transport)));
            });
        });
    },
  }),
  lifecycle({
    componentDidMount() {
      const { reloadFavorites } = this.props;
      reloadFavorites();

      this.timer = setInterval(() => {
        reloadFavorites();
      }, 5000);

      EventEmitter.on('change__schedule__favorite', reloadFavorites);
    },
    componentWillUnmount() {
      clearInterval(this.timer);
      EventEmitter.removeAllListeners('change__schedule__favorite');
    },
  }),
)(Screen);