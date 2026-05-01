import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={async (ev) => {
        try {
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {
          // ignore if haptics unavailable
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
