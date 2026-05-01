import React from 'react';
import { Text, type StyleProp, type TextStyle, OpaqueColorValue } from 'react-native';

type IconSymbolName = 'house.fill' | 'paperplane.fill' | 'chevron.left.forwardslash.chevron.right' | 'chevron.right';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: any;
}) {
  return (
    <Text style={[{ fontSize: size, color: color as any }, style]}>
      {/* Basic fallback since we removed @expo/vector-icons */}
      {name === 'house.fill' ? '🏠' : 
       name === 'paperplane.fill' ? '✈️' : 
       name === 'chevron.right' ? '▶' : '⚙️'}
    </Text>
  );
}
