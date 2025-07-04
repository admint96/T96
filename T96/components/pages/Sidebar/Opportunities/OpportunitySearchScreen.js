import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OpportunitySearchScreen = () => {
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const navigation = useNavigation();

  const handleSearch = () => {
    if (!skills && !location) {
      alert('Please enter skill or location or both');
      return;
    }

    navigation.navigate('JobResults', {
      skills,
      location,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
     
      <Pressable
        hitSlop={10}
        onPress={() => {
          navigation.navigate('Drawer', { screen: 'HomePage' });
        }}
      >
        <View style={styles.backArrow}>
          <Icon name="arrow-back" size={24} color="#000" />
        </View>
      </Pressable>

      <Text style={styles.title}>Find Jobs for You</Text>

      
      <TextInput
        style={styles.input}
        placeholder="Skill (e.g., React, Node)"
        placeholderTextColor="#8E8E93"
        value={skills}
        onChangeText={setSkills}
      />

      
      <TextInput
        style={styles.input}
        placeholder="Location (e.g., Remote, Hyderabad)"
        placeholderTextColor="#8E8E93"
        value={location}
        onChangeText={setLocation}
      />

      
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search Jobs</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  backArrow: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 24,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#1A1A1A',
  },
  button: {
    height: 56,
    backgroundColor: '#2563FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OpportunitySearchScreen;