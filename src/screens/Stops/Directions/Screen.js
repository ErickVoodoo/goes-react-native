/* 
* Screen 
* @module Screens/Stops/Directions 
* @flow  
*/

import React from 'react';
import { StyleSheet } from 'react-native';
import { isNil } from 'lodash';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { List } from 'react-native-elements';
import EventEmitter from 'react-native-eventemitter';

import { Loader, TapBar, NoItems, StopDirection, SwipableFlatList } from '../../../components';
import Colors from '../../../constants/colors';

import { getTabCounts } from '../../../utilities/parser';
import { getNextTime, makeTimeToReadableFormat } from '../../../utilities/time';
import { SCREEN_SCHEDULE } from '../../../constants/routes';

type IProps = {
  params: Object,
  navigation: Object,
  title: string,
  s_id: number | string,
}

export class Screen extends React.Component {
  props: IProps;

  state = {
    items: [],
    isLoading: true,
  }

  timer = null;
  componentWillMount = () => {
    this.timer = setInterval(() => {
      this.forceUpdate();
    }, 5000);

    window.ANALYTIC.page(window.ANALYTIC_PAGES.STOPS_ITEMS);
  }

  componentDidMount = () => {
    setTimeout(() => {
      this.getDirections();
    }, 500);

    EventEmitter.on('change__favorite', this.getDirections);
  }

  componentWillUnmount = () => {
    clearInterval(this.timer);
    EventEmitter.removeListener('change__favorite', this.getDirections);
  }

  getDirections = () => {
    const { navigation: { state: { params: { s_id } } } } = this.props;

    window.DB.query({
      sql: `
        SELECT times.pos pos, times.tms tms, directions.name direction, directions.id d_id, routes.type type, routes.name as transport, routes.id as r_id, directions.isfavorite isfavorite
        FROM times
        LEFT JOIN directions
        ON times.d_id=directions.id
        AND times.id_s=${s_id}
        LEFT JOIN routes
        ON directions.r_id=routes.id
        GROUP BY directions.id`,
    })
      .then((items) => {
        this.setState({
          items: items.filter(({ direction }) => direction).sort((a, b) => window.NaturalSort(a.transport, b.transport)),
          isLoading: false,
        });
      });
  }

  render() {
    const { navigation: { navigate, state: { params: { s_id, title, type } } } } = this.props;
    const { items, isLoading } = this.state;

    const buses = items
      .filter(({ type }) => type === 0)
      .sort((a, b) => window.NaturalSort(a.transport, b.transport))
      .map((item) => ({ ...item, key: `bus_${item.d_id}` }));

    const trolleybuses = items
      .filter(({ type }) => type === 1)
      .sort((a, b) => window.NaturalSort(a.transport, b.transport))
      .map((item) => ({ ...item, key: `trolley_${item.d_id}` }));

    const tramms = items
      .filter(({ type }) => type === 2)
      .sort((a, b) => window.NaturalSort(a.transport, b.transport))
      .map((item) => ({ ...item, key: `tramm_${item.d_id}` }));

    const metro = items
      .filter(({ type }) => type === 3)
      .sort((a, b) => window.NaturalSort(a.transport, b.transport)).sort((a, b) => window.compareNumbers(Number(a.transport), Number(b.transport)))
      .map((item) => ({ ...item, key: `metro_${item.d_id}` }));

    const getList = list => (<SwipableFlatList
      rowData={list.map(({ key, p, direction, transport, type, d_id, tms = null, r_id, isfavorite, ...props }) => {
        const nextPrev = getNextTime(tms);

        return (
          ({
            rowView: (<StopDirection
              key={key}
              transport={transport}
              d_id={d_id}
              direction={direction} 
              p={p} 
              type={type}
              nextPrev={nextPrev}
              isfavorite={isfavorite}
              onPress={() => {
                navigate(SCREEN_SCHEDULE, {
                  item: {
                    stop: title,
                    d_id,
                    s_id,
                    r_id,
                    direction,
                    type,
                    transport,
                    currentDirection: {
                      id: d_id,
                      name: direction,
                      transport,
                      r_id,
                      isfavorite,
                      type,
                    },
                  },
                  in: nextPrev && !isNil(nextPrev.minutes) ? `Через ${makeTimeToReadableFormat(nextPrev.minutes)}` : null,
                  noStopNavigation: true,
                });
              }}
            />),
            id: d_id,
            isfavorite,
            ...props,
          })
        );
      })}
      table={'directions'}
    />);

    return (
      <Loader isLoading={isLoading} style={styles.container}>
        {getTabCounts('bus', items) || getTabCounts('trolley', items) || getTabCounts('tramms', items) || getTabCounts('metro', items) ?
          <ScrollableTabView 
            locked
            renderTabBar={() => <TapBar />}
            initialPage={Number(type) || 0}
          >
            { getTabCounts('bus', items) !== 0 &&
              <List tabLabel="Автобусы" style={styles.tabView}>
                {buses && buses.length ?
                  getList(buses) :
                  <NoItems />
                }
              </List>
            }
            { getTabCounts('trolley', items) !== 0 &&
              <List tabLabel="Троллейбусы" style={styles.tabView}>
                { trolleybuses && trolleybuses.length ?
                  getList(trolleybuses) :
                  <NoItems />
                }
              </List>
            }
            { getTabCounts('tramms', items) !== 0 &&
              <List tabLabel="Трамваи" style={styles.tabView}>
                { tramms && tramms.length ?
                  getList(tramms) :
                  <NoItems />
                }
              </List>
            }
            { getTabCounts('metro', items) !== 0 &&
              <List tabLabel="Метро" style={styles.tabView}>
                { metro && metro.length ?
                  getList(metro) :
                  <NoItems />
                }
              </List>
            }
          </ScrollableTabView> :
          <NoItems />
        }
      </Loader>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    borderBottomColor: Colors.tabIconDefault,
    borderBottomWidth: 1,
  },
  item__type: {
    width: 6,
    height: '100%',
    backgroundColor: Colors.busColor,
    marginTop: 1,
    marginBottom: 1,
  },
  item_info: {
    height: 52,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrayColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
