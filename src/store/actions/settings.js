/* 
* Settings 
* @module Store/Actions
* @flow  
*/

export const setSettings = ({ payload }): Object => ({
  type: ACTIONS.SET_SETTINGS,
  payload,
});

export const ACTIONS = {
  SET_SETTINGS: 'SETTINGS/SET_SETTINGS',
};
