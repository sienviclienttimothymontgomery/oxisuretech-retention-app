import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Browser } from '@capacitor/browser';

export function ExternalLink({ href, children, ...rest }: any) {
  return (
    <TouchableOpacity
      {...rest}
      onPress={async (event) => {
        event.preventDefault();
        await Browser.open({ url: href });
      }}
    >
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}
