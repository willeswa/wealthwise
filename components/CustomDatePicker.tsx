import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface CustomDatePickerProps {
  show: boolean;
  value: Date;
  onChange: (event: any, date?: Date) => void;
  onClose: () => void;
  title?: string;
}

export const CustomDatePicker = ({ show, value, onChange, onClose, title }: CustomDatePickerProps) => {
  if (Platform.OS === 'ios') {
    return (
      <Modal
        visible={show}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
            <View style={styles.header}>
              <Pressable onPress={onClose}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => onChange({ type: 'set' }, value)}>
                <Text style={styles.doneButton}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={value}
              mode="date"
              display="spinner"
              onChange={onChange}
              textColor="#232D59"
              style={styles.picker}
            />
          </View>
        </View>
      </Modal>
    );
  }

  return show ? (
    <DateTimePicker
      value={value}
      mode="date"
      display="default"
      onChange={onChange}
      themeVariant="light"
      textColor="#232D59"
    />
  ) : null;
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#232D59',
    paddingTop: 16,
  },
  cancelButton: {
    color: '#FF9900',
    fontSize: 16,
  },
  doneButton: {
    color: '#232D59',
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    height: 200,
  },
});
