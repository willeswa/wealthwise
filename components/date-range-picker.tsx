import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, differenceInYears } from 'date-fns';
import { colors } from '../utils/colors'; // Import colors directly

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDatePress: () => void;
  onEndDatePress: () => void;
  title: string;
  repaymentPeriod: number;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDatePress,
  onEndDatePress,
  title,
  repaymentPeriod
}) => {
  const { width } = useWindowDimensions();
  const [minFontSize, setMinFontSize] = useState(width * 0.04);

  const formatDate = (date: Date) => {
    const yearsDifference = differenceInYears(endDate, startDate);

    if (yearsDifference > 0) {
      return format(date, "MMM yyyy");
    } else {
      return format(date, "MMM dd");
    } 
  };

  useEffect(() => {
    const startDateText = formatDate(startDate);
    const endDateText = formatDate(endDate);
    const startDateFontSize = calculateFontSize(startDateText, width);
    const endDateFontSize = calculateFontSize(endDateText, width);
    setMinFontSize(Math.min(startDateFontSize, endDateFontSize));
  }, [startDate, endDate, width, repaymentPeriod]);

  const calculateFontSize = (text: string, containerWidth: number) => {
    const baseFontSize = containerWidth * 0.04;
    const maxTextLength = 10; // Adjust this value based on your needs
    return text.length > maxTextLength ? baseFontSize * (maxTextLength / text.length) : baseFontSize;
  };

  return (
    <View style={styles.dateSelection}>
      <Text style={[styles.dateLabel, { fontSize: minFontSize * 0.5 }]}>{title}</Text>
      <View style={styles.scheduleInputs}>
        <View style={styles.datesRow}>
          <Pressable
            style={[styles.datePicker, styles.datePickerHalf]}
            onPress={onStartDatePress}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={18}
              color={colors.text.secondary}
            />
            <Text
              style={[styles.dateText, { fontSize: minFontSize }]}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.8}
            >
              {formatDate(startDate)}
            </Text>
            <Text
              style={[styles.dateHint, { fontSize: minFontSize * 0.5 }]}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.8}
            >
              Start
            </Text>
          </Pressable>

          <MaterialCommunityIcons
            name="arrow-right"
            size={18}
            color={colors.text.light}
          />

          <Pressable
            style={[styles.datePicker, styles.datePickerHalf]}
            onPress={onEndDatePress}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={18}
              color={colors.text.secondary}
            />
            <Text
              style={[styles.dateText, { fontSize: minFontSize }]}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.8}
            >
              {formatDate(endDate)}
            </Text>
            <Text
              style={[styles.dateHint, { fontSize: width * 0.03 }]}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.8}
            >
              End
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dateSelection: {
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  scheduleInputs: {
    flexDirection: 'column',
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.background.highlight,
    backgroundColor: colors.background.highlight,
    borderRadius: 32,
  },
  datePickerHalf: {
    flex: 1,
  },
  dateText: {

  },
  dateHint: {
    fontSize: 12,
    color: colors.text.light,
    marginHorizontal: 8,
  },
});

export default DateRangePicker;