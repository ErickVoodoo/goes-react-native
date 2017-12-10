/* 
* ListItem 
* @module Components 
* @flow  
*/

import React from 'react';
import { ListItem as ListItemElements } from 'react-native-elements';
import { isEqual } from 'lodash';

type IProps = {
  title: string;
  subtitle: string;
  hidden: boolean;
};

export class ListItem extends React.Component {
  props: IProps;

  shouldComponentUpdate = nextProps =>
    (!isEqual(this.props.title, nextProps.title) ||
    !isEqual(this.props.subtitle, nextProps.subtitle) ||
    !isEqual(this.props.hidden, nextProps.hidden));

  render() {
    return (
      <ListItemElements
        {...this.props}
      />
    );
  }
}
