/* 
* Common 
* @module Utils 
* @flow  
*/

import { NavigationActions } from 'react-navigation'

export const rad = x => (x * Math.PI) / 180;
// возвращает разницу между двумя поинтами в км 1.200 - 1 км 200 м
export const distanceBetweenTwoPoints = (p1, p2) => {
  const R = 6371; // earth's mean radius in km
  const dLat = rad(p2.latitude - p1.latitude);
  const dLong = rad(p2.longitude - p1.longitude);
   
  const a = (Math.sin(dLat / 2) * Math.sin(dLat / 2)) + (Math.cos(rad(p1.latitude)) * Math.cos(rad(p2.latitude)) * Math.sin(dLong / 2) * Math.sin(dLong / 2));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c * 1000;
   
  return d.toFixed(3);
}

export const replaceWith = (routeName, params) => NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName }, params),
  ],
})