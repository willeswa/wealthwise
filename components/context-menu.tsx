import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
  position?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
};

export const ContextMenu = ({ visible, onClose, items, position }: Props) => {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.menuContainer, position]}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  item.onPress();
                  onClose();
                }}
              >
                <Ionicons 
                  name={item.icon} 
                  size={18} 
                  color={item.color || colors.text.primary} 
                />
                <Text style={[
                  styles.menuText,
                  item.color ? { color: item.color } : null
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 6,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 15,
    color: colors.text.primary,
  },
});
