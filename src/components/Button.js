import React from 'react';
import { TouchableOpacity } from 'react-native';

export const Button = (props: { children: Object }) => (
  <TouchableOpacity {...props}>
    {props.children}
  </TouchableOpacity>
);
