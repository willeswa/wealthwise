import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HouseholdProfile, HouseholdSizeRange, HOUSEHOLD_PROFILES } from '../utils/types/preferences';

interface HouseholdSelectorProps {
  value: HouseholdProfile | null;
  onSelect: (profile: HouseholdProfile) => void;
  showDetails?: boolean; // Add this prop
}

export const HouseholdSelector = ({ value, onSelect, showDetails = false }: HouseholdSelectorProps) => {
  const [profile, setProfile] = useState<HouseholdProfile>(value || {
    composition: 'single',
    size: '1',
    primaryAge: 25,
    hasChildren: false
  });

  const [selected, setSelected] = useState<string | null>(value?.composition || 'single');
  const [showDetailsPanel, setShowDetailsPanel] = useState(showDetails); // Rename to avoid confusion

  // Add useEffect to handle initial selection
  useEffect(() => {
    if (!value) {
      handleSelect('single');
    }
  }, []);

  const handleSelect = (type: string) => {
    const profileData = HOUSEHOLD_PROFILES.find(p => p.id === type);
    if (!profileData) return;

    setSelected(type);
    setShowDetailsPanel(true);
    
    // Use the profile data to set initial values
    handleUpdate({
      composition: type as HouseholdProfile['composition'],
      size: type === 'single' ? '1' : type === 'couple' ? '2' : '3-4',  // Default size based on composition
      primaryAge: parseAgeGroup(profileData.ages[1]) // Default to second age group
    });
  };

  const handleUpdate = (updates: Partial<HouseholdProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    onSelect(newProfile);
  };

  // Modified renderProfileCard to show selection state
  const renderProfileCard = (item: typeof HOUSEHOLD_PROFILES[0]) => (
    <Pressable
      key={item.id}
      style={[
        styles.profileCard,
        selected === item.id && styles.profileCardSelected
      ]}
      onPress={() => handleSelect(item.id)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.illustration}>{item.illustration}</Text>
        <View style={styles.profileInfo}>
          <Text style={[
            styles.profileLabel,
            selected === item.id && styles.profileLabelSelected
          ]}>
            {item.label}
          </Text>
          <Text style={[
            styles.profileSublabel,
            selected === item.id && styles.profileSublabelSelected
          ]}>
            {item.sublabel}
          </Text>
        </View>
      </View>
      {selected === item.id && (
        <MaterialCommunityIcons 
          name="check-circle" 
          size={20} 
          color="#232D59"
          style={styles.checkIcon}
        />
      )}
    </Pressable>
  );

  const renderDetails = () => {
    const selectedProfile = HOUSEHOLD_PROFILES.find(p => p.id === selected);
    if (!selectedProfile) return null;

    return (
      <Animated.View style={styles.detailsContainer}>
        <View style={styles.ageSection}>
          <Text style={styles.sectionLabel}>Age Group</Text>
          <View style={styles.optionsGrid}>
            {selectedProfile.ages.map((age) => (
              <Pressable
                key={age}
                style={[
                  styles.optionButton,
                  age === getAgeGroup(profile.primaryAge) && styles.optionSelected
                ]}
                onPress={() => handleUpdate({ primaryAge: parseAgeGroup(age) })}
              >
                <Text style={[
                  styles.optionText,
                  age === getAgeGroup(profile.primaryAge) && styles.optionTextSelected
                ]}>
                  {age}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {selected === 'family' && renderSizeOptions()}
      </Animated.View>
    );
  };

  const renderSizeOptions = () => {
    const selectedProfile = HOUSEHOLD_PROFILES.find(p => p.id === selected);
    if (!selectedProfile || !selectedProfile.sizes) return null;

    return (
      <View style={styles.sizeSection}>
        <Text style={styles.sectionLabel}>Household Size</Text>
        <View style={styles.optionsGrid}>
          {selectedProfile.sizes.map((size) => (
            <Pressable
              key={size}
              style={[
                styles.optionButton,
                profile.size === size && styles.optionSelected
              ]}
              onPress={() => handleUpdate({ size })}
            >
              <Text style={[
                styles.optionText,
                profile.size === size && styles.optionTextSelected
              ]}>
                {size} {size === '1' ? 'person' : 'people'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.helpText}>Who are you planning for?</Text>
      <View style={styles.contentWrapper}>
        <View style={styles.profilesContainer}>
          {HOUSEHOLD_PROFILES.map(renderProfileCard)}
        </View>
        
        {showDetailsPanel && (
          <View style={styles.detailsContainer}>
            {renderDetails()}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  helpText: {
    fontSize: 16,
    color: '#232D59',
    fontWeight: '500',
    marginBottom: 16,
  },
  contentWrapper: {
    width: '100%',
    gap: 20,
  },
  profilesContainer: {
    width: '100%',
    gap: 8,
  },
  profileCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
  },
  profileCardSelected: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#232D59',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  illustration: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  profileInfo: {
    gap: 2,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232D59',
  },
  profileLabelSelected: {
    color: '#232D59',
  },
  profileSublabel: {
    fontSize: 13,
    color: '#666',
  },
  profileSublabelSelected: {
    color: '#232D59',
  },
  checkIcon: {
    marginLeft: 8,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    gap: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  optionSelected: {
    backgroundColor: '#232D59',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  ageSection: {
    gap: 8,
  },
  sizeSection: {
    gap: 8,
  },
});

// Helper functions
const getAgeGroup = (age: number): string => {
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  return '55+';
};

const parseAgeGroup = (group: string): number => {
  const [min] = group.split('-');
  return parseInt(min);
};
