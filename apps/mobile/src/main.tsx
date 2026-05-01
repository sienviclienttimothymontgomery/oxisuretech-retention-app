import React from 'react';
import { AppRegistry } from 'react-native';
import AppRouter from './AppRouter';

AppRegistry.registerComponent('App', () => AppRouter);

AppRegistry.runApplication('App', {
  initialProps: {},
  rootTag: document.getElementById('root')
});
