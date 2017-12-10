/* 
* Store 
* @module Store 
* @flow  
*/

import { combineReducers, createStore } from 'redux';

import settings from './reducers/settings';

export const reducers = combineReducers({
  settings,
});


export const store = createStore(
  reducers,
);
