import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  style?: object;
  textStyle?: object;
}

export const Button: React.FC<ButtonProps> = ({ 
  onPress, 
  title,
  style,
  textStyle
}) => {
  return (
    <Pressable 
      style={[styles.button, style]} 
      onPress={onPress}
    >
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#232D59",
    borderRadius: 32,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
