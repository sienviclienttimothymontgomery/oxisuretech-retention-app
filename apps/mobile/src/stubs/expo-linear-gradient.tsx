import React from 'react';
import { View } from 'react-native';

/**
 * Web stub for expo-linear-gradient's LinearGradient component.
 * Converts React Native start/end props to a CSS gradient direction.
 */
export function LinearGradient({ colors, style, children, start, end, ...props }: any) {
  let direction = '180deg'; // default: top to bottom

  if (start && end) {
    // Convert start/end {x, y} to CSS angle
    // start={0,0} end={1,0} → left to right → 90deg
    // start={0,0} end={0,1} → top to bottom → 180deg
    // start={0,0} end={1,1} → diagonal → 135deg
    const dx = (end.x ?? 0) - (start.x ?? 0);
    const dy = (end.y ?? 0) - (start.y ?? 0);
    const angleDeg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI) + 90;
    direction = `${angleDeg}deg`;
  }

  let gradientStr = '';
  if (colors && colors.length > 0) {
    gradientStr = `linear-gradient(${direction}, ${colors.join(', ')})`;
  }

  return (
    <View
      {...props}
      style={[style, { backgroundImage: gradientStr } as any]}
    >
      {children}
    </View>
  );
}
