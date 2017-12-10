/* 
* Settings
* @module Store/Reducers 
* @flow  
*/

import { ACTIONS } from '../actions/settings';

const initialReducer = {
  settings: [],
};

const { SET_SETTINGS } = ACTIONS;

export default function settings(store: Object = initialReducer, action: Object = {}) {
  const { type, payload } = action;

  switch (type) {
    case SET_SETTINGS: {
      if (payload) {
        return Object.assign({}, store, { settings: payload });
      }

      return store;
    }

    default:
      return store;
  }
}
