import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CountryFlag from "react-native-country-flag";
import { CountryInfo } from '../utils/constants/countries';

interface CountryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: CountryInfo) => void;
  countries: CountryInfo[];
  selectedCountry?: string;
}

// Add new CountryItem component
const CountryItem = memo(({ 
  item, 
  isSelected, 
  onSelect 
}: { 
  item: CountryInfo; 
  isSelected: boolean; 
  onSelect: () => void;
}) => (
  <Pressable
    style={[
      styles.countryItem,
      isSelected && styles.selectedItem
    ]}
    onPress={onSelect}
  >
    <View style={styles.flagWrapper}>
      <CountryFlag isoCode={item.code} size={20} />
    </View>
    <Text style={styles.countryName}>{item.name}</Text>
    <Text style={[
      styles.currencyCode,
      isSelected && styles.selectedText
    ]}>
      {item.currency}
    </Text>
    {isSelected && (
      <MaterialCommunityIcons 
        name="check" 
        size={18} 
        color="#232D59" 
      />
    )}
  </Pressable>
), (prevProps, nextProps) => 
  prevProps.isSelected === nextProps.isSelected
);

export const CountryModal = ({
  visible,
  onClose,
  onSelect,
  countries,
  selectedCountry
}: CountryModalProps) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef<FlatList>(null);
  const [filteredCountries, setFilteredCountries] = useState(countries);

  // Filter countries when search query changes
  useEffect(() => {
    const filtered = countries.filter(country => 
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.currency.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCountries(filtered);
  }, [searchQuery, countries]);

  // Reset search and scroll to selected country when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery(''); // Reset search
      // Delay scroll to after modal animation
      setTimeout(() => {
        if (selectedCountry && !searchQuery) {
          const index = filteredCountries.findIndex(c => c.code === selectedCountry);
          if (index !== -1) {
            try {
              listRef.current?.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.3
              });
            } catch (error) {
              console.log('Scroll error handled gracefully');
            }
          }
        }
      }, 500);
    }
  }, [visible]);

  const handleScroll = useCallback((error: any) => {
    if (error) {
      // Fallback to scrollToOffset if scrollToIndex fails
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 56, // Height of each item
    offset: 56 * index,
    index,
  }), []);

  const renderItem = useCallback(({ item }: { item: CountryInfo }) => (
    <CountryItem
      item={item}
      isSelected={selectedCountry === item.code}
      onSelect={() => {
        onSelect(item);
        onClose();
      }}
    />
  ), [selectedCountry, onSelect, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <View style={styles.handleBar} />
            <Text style={styles.title}>Select Country</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          <View style={styles.modalInner}>
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search countries..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#666"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons name="close-circle" size={18} color="#666" />
                </Pressable>
              )}
            </View>

            <View style={styles.listContainer}>
              <FlatList
                ref={listRef}
                data={filteredCountries}
                renderItem={renderItem}
                keyExtractor={useCallback((item: CountryInfo) => item.code, [])}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                onScrollToIndexFailed={handleScroll}
                getItemLayout={getItemLayout}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                windowSize={5}
                maintainVisibleContentPosition={{
                  minIndexForVisible: 0,
                }}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No countries found</Text>
                  </View>
                )}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%', // Fixed height instead of maxHeight
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#232D59',
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#232D59',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 2,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    gap: 8,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 12,
  },
  selectedItem: {
    backgroundColor: '#f8f9fd',
    borderWidth: 1,
    borderColor: '#E6E8F0',
  },
  flagWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#232D59',
  },
  currencyCode: {
    fontSize: 13,
    color: '#666',
    marginRight: 8,
  },
  selectedText: {
    color: '#fff',
  },
  modalInner: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  listContainer: {
    flex: 1,
    minHeight: 0, // Important for proper flex behavior
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
  },
});
