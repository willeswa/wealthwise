import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HouseholdSelector } from './HouseholdSelector';
import { usePreferencesStore } from '../store/preferences-store';
import { useModalStore } from '../store/modal-store';
import { Button } from './Button';
import { HouseholdProfile } from '../utils/types/preferences';

export const EditProfileModal = () => {
  const { householdProfile, setPreferences } = usePreferencesStore();
  const { closeModal } = useModalStore();
  const [tempProfile, setTempProfile] = useState<HouseholdProfile | null>(householdProfile);

  const handleUpdate = (profile: HouseholdProfile) => {
    setTempProfile(profile);
  };

  const handleSave = () => {
    if (tempProfile) {
      setPreferences({ householdProfile: tempProfile });
      closeModal();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <View style={styles.content}>
        <HouseholdSelector 
          value={tempProfile}
          onSelect={handleUpdate}
          showDetails={true} // Always show details in edit mode
        />
      </View>
      <Button 
        onPress={handleSave} 
        disabled={!tempProfile} // Fixed: Now disabled when there's no profile
        title='Save'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#929ABE",
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
