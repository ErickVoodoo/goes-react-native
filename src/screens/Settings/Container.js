/* 
* Container 
* @module Screens/Settings 
* @flow  
*/

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Screen } from './Screen';
import { setSettings } from '../../store/actions/settings';

const mapDispatchToProps = dispatch =>
  bindActionCreators({
    setSettings,
  }, dispatch);

export const Settings = connect(null, mapDispatchToProps)(Screen);
