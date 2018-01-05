/* 
* Scene 
* @module Screens/Directions 
* @flow  
*/

import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { isNil } from 'lodash';
import { Actions } from 'react-native-router-flux';
import EventEmitter from 'react-native-eventemitter';

import { Loader, DirectionStop } from '../../../components';
import { getNextTime, makeTimeToReadableFormat } from '../../../utilities/time';

import { SCREEN_SCHEDULE } from '../../../constants/routes';

type IProps = {
  navigation: Object,
  currentDirection: Object,
  reverseDirection: Object,
}

export class Screen extends React.Component {
  props: IProps;

  state = {
    items: [],
    currentIdDirection: null,
    isLoading: true,
  }

  componentWillMount = () => {
    this.timer = setInterval(() => {
      this.forceUpdate();
    }, 5000);

    EventEmitter.on('change__direction', this.changeDirection);
    EventEmitter.on('change__favorite', () => {
      const { navigation: { state: { params: { currentDirection: { id: c_id, r_id: c_r_id }, reverseDirection } } } } = this.props;

      if (reverseDirection) {
        const { id: r_id, r_id: r_r_id } = reverseDirection;
        const isCurrent = this.state.currentIdDirection === c_id;

        this.getSchedule(isCurrent ? c_id : r_id, isCurrent ? c_r_id : r_r_id, true);
      } else {
        this.getSchedule(c_id, c_r_id, true);
      }
    });

    window.ANALYTIC.page(window.ANALYTIC_PAGES.DIRECTIONS_ITEMS);
  }

  componentDidMount = () => {
    const { navigation: { state: { params: { currentDirection: { id, r_id } } } } } = this.props;
    setTimeout(() => {
      this.getSchedule(id, r_id);
    }, 500);
  }

  timer = null;

  componentWillUnmount = () => {
    clearInterval(this.timer);
    EventEmitter.removeAllListeners('change__favorite');
    EventEmitter.removeAllListeners('change__direction');
  }

  changeDirection = () => {
    const { navigation: { state: { params: { currentDirection, reverseDirection } } } } = this.props;

    const isCurrent = this.state.currentIdDirection === currentDirection.id;
    this.getSchedule(isCurrent ? reverseDirection.id : currentDirection.id, isCurrent ? reverseDirection.r_id : currentDirection.r_id);

    Actions.refresh({ title: isCurrent ? reverseDirection.name : currentDirection.name });
  }

  getSchedule = (d_id, r_id, noLoader = false) => {
    this.setState({
      isLoading: !noLoader,
    }, () => {
      window.DB.query({
        sql: `
          SELECT times.pos pos, times.tms tms, stops.n stop, stops.p p, stops.id s_id, stops.isfavorite isfavorite, times.d_id d_id, times.r_id r_id
          FROM times
          LEFT JOIN stops
          ON times.id_s=stops.id
          AND times.d_id=${d_id}
          AND times.r_id=${r_id}
          ORDER BY times.pos`,
      })
        .then((items) => {
          this.setState({
            items: items.filter(({ stop }) => stop).map(({ s_id, ...props }) => ({ ...props, s_id, key: `direction_stop_${s_id}` })),
            currentIdDirection: d_id,
            isLoading: false,
          });
        });
    });
  }

  render() {
    const { navigation: { navigate, state: { params: { currentDirection, reverseDirection } } } } = this.props;
    const { items, currentIdDirection, isLoading } = this.state;

    const isCurrent = currentIdDirection === currentDirection.id;
    const direction = isCurrent ? currentDirection : reverseDirection;

    return (
      <Loader isLoading={isLoading} style={styles.container}>
        <FlatList
          data={items}
          style={styles.container}
          renderItem={({ item: { tms, ...props } }) => {
            const nextPrev = getNextTime(tms);

            return (
              <DirectionStop
                {...props}
                nextPrev={nextPrev}
                onPress={() => {
                  navigate(SCREEN_SCHEDULE, {
                    item: {
                      ...props,
                      r_id: direction.r_id,
                      direction: direction.name,
                      type: direction.type,
                      transport: direction.transport,
                      currentDirection: direction,
                    },
                    in: nextPrev && !isNil(nextPrev.minutes) ? `Через ${makeTimeToReadableFormat(nextPrev.minutes)}` : null,
                    noDirectionNavigation: true,
                  });
                }}
              />
            );
          }}
          keyExtractor={item => item.key}
        />
      </Loader>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
  },
});
