import { Ionicons } from '@expo/vector-icons';
import { TabTriggerSlotProps } from 'expo-router/ui';
import { ComponentProps, Ref, forwardRef } from 'react';
import { Text, Pressable, View } from 'react-native';

type Icon = ComponentProps<typeof Ionicons>['name'];

export type TabButtonProps = TabTriggerSlotProps & {
  icon?: Icon;
};

export const TabButton = forwardRef(
  ({ icon, children, isFocused, ...props }: TabButtonProps, ref: Ref<View>) => {
    return (
      <Pressable
        ref={ref}
        {...props}
        style={{
          flex: 1,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 4,
          padding: 8,
          backgroundColor: isFocused ? '#E5E5EA' : 'rgba(254,254,254,0.1)',
          borderRadius: 32,
        }}>
        <Ionicons
          name={icon}
          size={16}
          color={isFocused ? '#232D59' : '#FBEDDA'}
        />
        {isFocused && (
          <Text style={{ color: '#232D59', fontSize: 12 }}>
            {children}
          </Text>
        )}
      </Pressable>
    );
  }
);
