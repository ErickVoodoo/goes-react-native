/*
* withSettings 
* @module Decorators
* @flow
*/

export const withSettings = params => (
  window.DB.select({ table: 'settings' })
    .then((settings) => ({ params, settings }))
);