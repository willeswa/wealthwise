import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useModalStore } from '../store/modal-store';
import { HouseholdProfile, HOUSEHOLD_PROFILES } from '../utils/types/preferences';

interface ProfileStatsProps {
  householdProfile: HouseholdProfile | null;
}

export const ProfileStatsCard = ({ householdProfile }: ProfileStatsProps) => {
  const { openModal } = useModalStore();

  if (!householdProfile) return null;

  // Find the profile data from HOUSEHOLD_PROFILES
  const profileData = HOUSEHOLD_PROFILES.find(p => p.id === householdProfile.composition);

  if (!profileData) return null;

  const getAgeRange = (age: number): string => {
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    return '55+';
  };

  const formatSize = (size: string): string => {
    return size === '1' ? '1 person' : 
           size === '2' ? '2 people' : 
           `${size} people`;
  };

  return (
    <Pressable 
      onPress={() => openModal('edit-profile')} 
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Household Profile</Text>
        <Ionicons name="pencil" size={16} color={colors.accent} />
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.emoji}>{profileData.illustration}</Text>
          <Text style={styles.statLabel}>
            {profileData.label}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatSize(householdProfile.size)}</Text>
          <Text style={styles.statLabel}>Size</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getAgeRange(householdProfile.primaryAge)}</Text>
          <Text style={styles.statLabel}>Age Range</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.background.highlight,
  },
});
