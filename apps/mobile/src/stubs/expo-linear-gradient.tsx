import React from 'react';
import { View } from 'react-native';

export function LinearGradient({ colors, style, children, start, end, ...props }: any) {
  // Convert standard React Native style objects to CSS for web
  // colors is usually an array like ['rgba(0,0,0,0.8)', 'transparent']
  let gradientStr = '';
  if (colors && colors.length > 0) {
    gradientStr = `linear-gradient(180deg, ${colors.join(', ')})`;
  }

  // Very basic approximation for the web
  return (
    <View
      {...props}
      style={[style, { backgroundImage: gradientStr } as any]}
    >
      {children}
    </View>
  );
}
