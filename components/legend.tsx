import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

type LegendItem = {
  color: string;
  label: string;
  value: string;
};

type LegendProps = {
  items: LegendItem[];
};

export const Legend = ({ items }: LegendProps) => {
  return (
    <View style={styles.legendContainer}>
      {items.map((item, index) => (
        <View
          key={index}
          style={[styles.legendItem, { borderLeftColor: item.color }]}
        >
          <View>
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text style={styles.legendValue}>{item.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start",
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.background.highlight,
    borderRadius: 4,
    minWidth: 70,
    marginBottom: 8,
  },
  legendLabel: {
    fontSize: 12,
    color: "black",
    fontWeight: "900",
  },
  legendValue: {
    fontSize: 11,
    color: colors.text.primary,
  },
});
