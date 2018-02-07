import React from 'react';
import styled from 'styled-components/native';
import { Animated, Easing, Text, TouchableOpacity, Image } from 'react-native';
import { isNil } from 'lodash';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import noun from 'plural-ru';
import { Flex } from '../../components';
import { SCREEN_STOP_DIRECTIONS } from '../../constants/routes';
import { SETTINGS_KEYS } from '../../constants/config';

const HEIGHT = 200;

const Container = styled.View`
  width: 100%;
  height: ${HEIGHT}px;
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: #fff;
  border-top-width: 1px;
  border-top-color: #e6e6e6;
  z-index: 1;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  padding-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  font-style: italic;
  color: #a6a6a6;
`;

const Icons = styled(Flex)`
  height: 40px;
  padding: 4px 12px;
  border-bottom-width: 1px;
  border-bottom-color: #e6e6e6;
  background-color: #f6f6f6;
`;

const Buttons = styled(Flex)`
  height: 65px;
  padding: 12px;
  border-top-width: 1px;
  border-top-color: #e6e6e6;
  background-color: #f6f6f6;
`;

const Content = styled(Flex)`
  flex: 1;
  padding: 12px;
`;

const Distance = styled(Flex)`
  width: 25%;
`;

const Button = styled(Flex)`
  border-radius: 4px;
  flex: 1;
`;

type IProps = {
  isHidden: boolean,
  map: Object,
}

export class CallOut extends React.Component {
  props: IProps;
  constructor(props) {
    super(props);
    this.state = {
      animation: new Animated.Value(-HEIGHT),
      isMinimal: false,
      types: [],
    }
  }

  componentWillReceiveProps(nextProps) {
    const { isHidden, id } = nextProps;
    const { isHidden: wasHidden } = this.props;
    const { animation } = this.state;

    if (wasHidden && !isHidden) {
      Animated.timing(animation, {
        toValue: 0,
        easing: Easing.in(),
        duration: 500,
      })
        .start();
    } else if (!wasHidden && isHidden) {
      Animated.timing(animation, {
        toValue: -HEIGHT,
        easing: Easing.in(),
        duration: 500,
      })
        .start();
      this.setState({
        isMinimal: false,
      });
    }

    this.getTypes(id ? nextProps : this.props);
  }

  getTypes = (props) => {
    const { id } = props;

    if (id) {
      window.DB.query({
        sql: `
          SELECT times.pos pos, times.tms tms, directions.name direction, directions.id d_id, routes.type type, routes.name as transport, routes.id as r_id, directions.isfavorite isfavorite
          FROM times
          LEFT JOIN directions
          ON times.d_id=directions.id
          AND times.id_s=${id}
          LEFT JOIN routes
          ON directions.r_id=routes.id
          GROUP BY directions.id`,
      })
        .then((items) => {
          this.setState({
            types: items.map(({ type }) => type).filter((type, index, arr) => !isNil(type) && arr.indexOf(type) === index).sort(),
          });
        });
    }
  }

  handleMinimal = (is) => {
    const { animation } = this.state;

    if (!is) {
      Animated.timing(animation, {
        toValue: 0,
        easing: Easing.in(),
        duration: 500,
      })
        .start();
    } else {
      Animated.timing(animation, {
        toValue: -HEIGHT + 40,
        easing: Easing.in(),
        duration: 500,
      })
        .start();
    }

    this.setState({
      isMinimal: is,
    });
  }

  render = () => {
    const { navigation, id, n, p, distance, lat, lng, map } = this.props;
    const { animation, types = [], isMinimal } = this.state;

    return (
      <Animated.View
        style={{
          bottom: animation,
          zIndex: 1,
        }}
      >
        <Container>
          <Icons row>
            <Flex row size={1} align={'center'} style={{ width: 'auto' }}>
              {types.includes(0) &&
                <Image
                  style={{ width: 30, height: 30, marginRight: 8 }}
                  source={require('../../../assets/transport/bus.png')}
                />
              }
              {types.includes(1) &&
                <Image
                  style={{ width: 30, height: 30, marginRight: 8 }}
                  source={require('../../../assets/transport/trolley.png')}
                />
              }
              {types.includes(2) &&
                <Image
                  style={{ width: 30, height: 30, marginRight: 8 }}
                  source={require('../../../assets/transport/tram.png')}
                />
              }
              {types.includes(3) &&
                <Image
                  style={{ width: 30, height: 30 }}
                  source={require('../../../assets/transport/metro.png')}
                />
              }
            </Flex>
            <Flex row size={1} justify={'flex-end'} align={'center'} style={{ width: 'auto' }}>
              {isMinimal && <Text style={{ fontSize: 16, marginRight: 12, fontWeight: 'bold' }}>{`${parseInt(distance || 0, 10)} ${noun(parseInt(distance || 0, 10), 'метр', 'метра', 'метров')}`}</Text>}
              { isMinimal ?
                <FontAwesome name='angle-up' size={28} color={window.SETTINGS[SETTINGS_KEYS[0]]} onPress={() => this.handleMinimal(false)} /> :
                <FontAwesome name='angle-down' size={28} color={window.SETTINGS[SETTINGS_KEYS[0]]} onPress={() => this.handleMinimal(true)} />
              }
            </Flex>
          </Icons>
          <Content row>
            <Flex column size={1}>
              <Title>{n}</Title>
              <Subtitle>{`${p ? `(${p})` : ''}`}</Subtitle>
            </Flex>
            {!isMinimal && 
              <Distance align={'center'} justify={'center'}>
                <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{parseInt(distance || 0, 10)}</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{noun(parseInt(distance || 0, 10), 'метр', 'метра', 'метров')}</Text>
              </Distance>
            }
          </Content>
          <Buttons row align={'center'}>
            <TouchableOpacity 
              onPress={() => {
                map.animateToCoordinate({
                  latitude: Number(lat), 
                  longitude: Number(lng),
                }, 500);
              }}
              style={{ flex: 1, marginRight: 4 }}
              activeOpacity={0.6}
            >
              <Button align={'center'} justify={'center'} style={{ backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]] }}>
                <Text style={{ fontSize: 14, color: '#fff' }}>
                  К маркеру
                </Text>
              </Button>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                navigation.navigate(SCREEN_STOP_DIRECTIONS, { s_id: id, title: n, p })
              }}
              style={{ flex: 1, marginLeft: 4 }}
              activeOpacity={0.6}
            >
              <Button align={'center'} justify={'center'} style={{ backgroundColor: window.SETTINGS[SETTINGS_KEYS[0]] }}>
                <Text style={{ fontSize: 14, color: '#fff' }}>
                  К расписанию
                </Text>
              </Button>
            </TouchableOpacity>
          </Buttons>
        </Container>
      </Animated.View>
    );
  }
}
  