import React, { Component } from 'react';
import { Animated } from 'react-native';
import { isEqual } from 'lodash';

type IProps = {
  style: Object,
  children: any,
  withoutFlex: boolean,
  changer: any,
}

export class Fade extends Component {
  props: IProps;

  state = {
    visible: false,
  };

  componentWillMount() {
    this.visibility = new Animated.Value(0);
  }

  componentDidMount = () => {
    this.animate();
  }

  componentWillReceiveProps = (nextProps) => {
    if (!isEqual(nextProps.changer, this.props.changer)) {
      this.setState({
        visible: false,
      }, () => {
        this.visibility = new Animated.Value(0);
        this.animate(nextProps);
      });
    }
  }

  animate = (props) => {
    const { delay = 0, duration } = props || this.props;

    Animated.timing(this.visibility, {
      toValue: 1,
      duration: duration || 300,
      delay,
    }).start(() => {
      this.setState({
        visible: true,
      });
    });
  }

  render() {
    const { style, children, withoutFlex = false } = this.props;

    const containerStyle = {
      opacity: this.visibility.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          scale: this.visibility.interpolate({
            inputRange: [0, 1],
            outputRange: [1.02, 1],
          }),
        },
      ],
      width: '100%',
      ...withoutFlex ? { } : { flex: 1, height: '100%' },
    };

    const combinedStyle = [containerStyle, style];

    return (
      <Animated.View style={this.state.visible ? combinedStyle : containerStyle}>
        {children}
      </Animated.View>
    );
  }
}
