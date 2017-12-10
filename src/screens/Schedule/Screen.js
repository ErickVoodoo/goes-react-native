/* 
* Screen 
* @module Screens/Schedule 
* @flow  
*/

import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import EventEmitter from 'react-native-eventemitter';
import hexToRgba from 'hex-rgba';
import { isNil } from 'lodash';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
import { Loader, ContainerText } from '../../components';
import { getSchedule, daysToTime, getTransportColor } from '../../utilities/parser';
import { getNextTransport, getSummOfTime, makeArrayFromTime, getCorrectHours, addZeroPrefix, getHourMinutes, makeTimeToReadableFormat, getNextTime } from '../../utilities/time';
import { SETTINGS_KEYS } from '../../constants/config';
import Colors from '../../constants/colors';

import { SCREEN_DIRECTION_STOPS, SCREEN_STOP_DIRECTIONS } from '../../constants/routes';

type IProps = {
  route: Object,
  item: Object,
  noDirectionNavigation: boolean,
  noStopNavigation: boolean,
}

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
const DAYS_SHORT = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

export class Screen extends React.Component {
  props: IProps;

  state = {
    schedule: null,
    nextTime: {},
    isScrolledToTime: false,
    isLoading: true,
  }

  scrolls: Object[] = [];
  times: Object[]= [];
  scrollViewHeight: number = 0;

  timer = null;

  componentWillMount = () => {
    const { item: { d_id, s_id } } = this.props;

    EventEmitter.on('favorite', () => {
      EventEmitter.emit('change_favorite_status', true);

      console.log('Add to favorite stops!');
    });

    EventEmitter.on('unfavorite', () => {
      EventEmitter.emit('change_favorite_status', false);

      console.log('Remove from favorite stops!');
    });

    setTimeout(() => {
      window.DB.query({
        sql: `
          SELECT *
          FROM times
          WHERE d_id=${d_id} AND id_s=${s_id}`,
      })
        .then((schedule) => {
          const sch = getSchedule(schedule[0].tms);
          const days = daysToTime(sch);
          const nextTime = getNextTime(schedule[0].tms);

          this.setState({
            schedule: schedule[0],
            days,
            nextTime,
            selectedDay: nextTime.properDay,
            isLoading: false,
          });
        });
    }, 500);

    this.timer = setInterval(() => {
      const { schedule } = this.state;
      const nextTime = getNextTime(schedule.tms);

      if (!isNil(nextTime.minutes)) {
        Actions.refresh({ in: `Через ${makeTimeToReadableFormat(nextTime.minutes)}` });
      } else {
        Actions.refresh({ in: 'Окончен' });
      }

      this.setState({
        nextTime,
      });
    }, 5000);

    // EventEmitter.emit('change_favorite_status', true);

    window.ANALYTIC.page(window.ANALYTIC_PAGES.SCHEDULE);
  }

  componentWillUnmount = () => {
    clearInterval(this.timer);
  }

  getRouteParams = () => this.props.route.params || {};

  isActiveDay = (dayId: number, properDay: number) => dayId === properDay;

  isActiveHour = (time: string, hour: string) => {
    const { hours } = getHourMinutes(time);

    return hours === hour;
  }

  render() {
    const { item, noStopNavigation, noDirectionNavigation } = this.props;
    const { days = [], nextTime: { time, properDay, isPrevious } = {}, selectedDay: dayId, isLoading } = this.state;

    const MAIN_APPLICATION_COLOR = window.SETTINGS[SETTINGS_KEYS[0]];

    let hours = [];
    let nextTransport = null;

    if (days && days.length) {
      hours = days.find(({ id }) => id === dayId).hours;
      nextTransport = time ? getNextTransport(isPrevious, dayId, properDay, makeArrayFromTime(hours)) : 0;
    }

    const nextTransportHours = getHourMinutes(nextTransport).hours;

    return (
      <Loader isLoading={isLoading || !days.length} style={styles.container}>
        { days.length &&
          <View style={{ flex: 1, width: '100%', height: '100%' }}>
            <LinearGradient
              style={[styles.meta]}
              colors={[MAIN_APPLICATION_COLOR, hexToRgba(MAIN_APPLICATION_COLOR, 100)]}
              start={{ x: 0, y: 0.1 }} 
              end={{ x: 0.1, y: 1 }}
            >
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  window.ANALYTIC.event(window.ANALYTIC_EVENTS.SCHEDULE_DIRECTION);

                  if (noDirectionNavigation) {
                    Actions.pop();
                  } else {
                    Actions[SCREEN_DIRECTION_STOPS]({
                      r_id: item.r_id,
                      title: item.direction,
                      currentDirection: item.currentDirection,
                    });
                  }
                }}
              >
                <ContainerText
                  containerStyle={styles.border}
                  textStyle={styles.meta_text}
                  leftIcon={
                    <View style={[styles.meta__direction__icon, StyleSheet.create({ i: { backgroundColor: getTransportColor(item.type) } }).i]}>
                      <Text style={styles.meta__direction__icon__text}>
                        {item.transport}
                      </Text>
                    </View>
                  }
                >
                  {item.direction}
                </ContainerText>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  window.ANALYTIC.event(window.ANALYTIC_EVENTS.SCHEDULE_STOP);

                  if (noStopNavigation) {
                    Actions.pop();
                  } else {
                    Actions[SCREEN_STOP_DIRECTIONS]({
                      s_id: item.s_id,
                      title: item.stop,
                    });
                  }
                }}
              >
                <ContainerText
                  containerStyle={[styles.meta__stop, styles.border]}
                  textStyle={styles.meta_text}
                  leftIcon={
                    <View style={[styles.meta__direction__icon, StyleSheet.create({ i: { backgroundColor: getTransportColor(item.type) } }).i]}>
                      <Image
                        source={require('../../../assets/images/bench-white.png')}
                        style={{ width: 16, height: 16 }}
                      />
                    </View>
                  }
                >
                  {item.stop}
                </ContainerText>
              </TouchableOpacity>
              <View style={[styles.meta__day]}>
                {
                  DAYS
                    .map((day, index) => ({ day, index }))
                    .filter((day, index) => days.find(({ id }) => id === index))
                    .map(({ index }) => (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={0.5}
                        onPress={() => {
                          window.ANALYTIC.event(window.ANALYTIC_EVENTS.SCHEDULE_DAY);
                          this.setState({
                            selectedDay: index,
                          });
                        }}
                      >
                        <View
                          style={[
                            styles.meta__day__button__day,
                            this.state.selectedDay === index ? styles['meta__day__button__day--active'] : null,
                            properDay === index ? { borderColor: getTransportColor(item.type) } : null,
                          ]}
                        >
                          <Text
                            style={[
                              { textAlign: 'center' },
                              this.state.selectedDay === index ? { color: MAIN_APPLICATION_COLOR } : { color: Colors.noticeText },
                            ]}
                          >
                            {DAYS_SHORT[index]}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ),
                  )
                }
              </View>
            </LinearGradient>
            <View
              key={dayId}
              style={styles.view}
              tabLabel={DAYS[dayId]}
              onLayout={(e) => {
                this.scrollViewHeight = e.nativeEvent.layout.height;
              }}
            >
              <ScrollView
                ref={(ref) => { this.scrolls[dayId] = ref; }}
                style={styles.view__tab}
                onContentSizeChange={(width, height) => {
                  const { isScrolledToTime } = this.state;
                  const scroll = this.scrolls[properDay];
                  const element = this.times[`${properDay}_${Math.floor(nextTransport / 60)}`];

                  if (scroll && element && !isScrolledToTime) {
                    element.measure((ex, ey) => {
                      if (hours.length >= this.scrollViewHeight / 50) {
                        const hourLeft = hours.length - hours.findIndex(({ hour }) => getCorrectHours(hour) === getCorrectHours(Math.floor(nextTransport / 60)));
                        const scrollOffset = hourLeft * 50 < this.scrollViewHeight ? height - this.scrollViewHeight : ey;

                        this.scrolls[properDay].scrollTo({ y: scrollOffset, animated: true });

                        this.setState({
                          isScrolledToTime: true,
                        });
                      }
                    });
                  }
                }}
              >
                {hours.map(({ hour, minutes }) => (
                  <View
                    ref={(ref) => { this.times[`${dayId}_${hour}`] = ref; }}
                    key={`${dayId}_${hour}`}
                    style={[
                      styles.view__tab__line,
                      this.isActiveHour(nextTransport, hour) && this.isActiveDay(dayId, properDay) ? StyleSheet.create({ i: { backgroundColor: getTransportColor(item.type) } }).i : null,
                    ]}
                  >
                    <View
                      style={
                        styles.view__tab__line__hour__container
                      }
                    >
                      <Text
                        style={[
                          styles.view__tab__line__hour,
                          this.isActiveHour(nextTransport, hour) && this.isActiveDay(dayId, properDay) ? styles['view__tab__line--active__text'] : null,
                        ]}
                      >
                        {addZeroPrefix((getCorrectHours(hour)).toString())}
                      </Text>
                    </View>
                    <ScrollView
                      horizontal
                      decelerationRate={0}
                      style={[
                        styles.view__tab__line__minutes__container__scroll,
                        this.isActiveHour(nextTransport, hour) && this.isActiveDay(dayId, properDay) ? StyleSheet.create({ i: { borderBottomWidth: 0 } }).i : null,
                      ]}
                    >
                      <View
                        style={[
                          styles.view__tab__line__minutes,
                        ]}
                      >
                        {[ ...new Set(minutes)].map(minute => (
                          <View
                            key={`${dayId}_${hour}_${minute}`}
                            style={[
                              styles.view__tab__line__minutes__container,
                              nextTransport === getSummOfTime(hour, minute) ? styles['view__tab_line_minutes_item--active'] : null,
                            ]}
                          >
                            <Text
                              style={[
                                styles.view__tab__line__minutes__item,
                                nextTransportHours === hour && dayId === properDay ? styles['view__tab__line--active__text'] : null,
                              ]}
                            >
                              {minute}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        }
      </Loader>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  view: {
    flex: 1,
  },
  view__tab: {
    flex: 1,
  },
  view__tab__line: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: 50,
  },
  view__tab__line__hour__container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  view__tab__line__hour: {
    fontSize: 22,
    backgroundColor: 'transparent',
  },
  view__tab__line__minutes__container__scroll: {
    borderBottomColor: Colors.lightGrayColor,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    flex: 1,
    width: '100%',
  },
  view__tab__line__minutes: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  view__tab__line__minutes__container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    backgroundColor: 'transparent',
    height: 32,
  },
  view__tab__line__minutes__item: {
    fontSize: 14,
  },
  'view__tab__line--active__text': {
    color: Colors.noticeText,
  },
  'view__tab_line_minutes_item--active': {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.noticeText,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 6,
    paddingBottom: 6,
  },
  border: {
    borderWidth: 1,
    borderColor: Colors.noticeText,
    backgroundColor: 'transparent',
  },
  meta__direction: {

  },
  meta__stop: {
    marginTop: 8,
  },
  meta__day: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 52,
    width: '100%',
  },
  meta__day__button: {
    borderBottomColor: Colors.darkGray,
    borderBottomWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta__day__button__day: {
    borderColor: '#fff',
    borderWidth: 1,
    height: 30,
    margin: 2,
    width: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  'meta__day__button__day--active': {
    backgroundColor: Colors.noticeText,
  },
  meta_text: {
    fontSize: 16,
    color: Colors.noticeText,
  },
  meta__direction__icon: {
    width: 36,
    height: 36,
    borderRadius: 25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  meta__direction__icon__text: {
    fontSize: 14,
    color: Colors.noticeText,
  },
});
