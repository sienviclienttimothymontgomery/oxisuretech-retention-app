import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter';

// react-native-web 0.21 uses the legacy ReactDOM.render() API which was removed
// in React 19. We bypass AppRegistry entirely and mount with createRoot instead.
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<AppRouter />);
