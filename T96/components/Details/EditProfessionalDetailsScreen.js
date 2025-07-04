import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../config';

import Icon from 'react-native-vector-icons/Ionicons';

export function EditProfessionalDetailsScreen({ route, navigation }) {
  const {
    userId,
    currentIndustry,
    department: initialDepartment,
    designation: initialDesignation,
    onGoBack,
  } = route.params;

  const [industry, setIndustry] = useState(currentIndustry || '');
  const [department, setDepartment] = useState(initialDepartment || '');
  const [designation, setDesignation] = useState(initialDesignation || '');

  const handleSave = async () => {
    if (!department.trim() || !designation.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert(
          'Authentication Error',
          'User token is missing. Please log in again.'
        );
        return;
      }

      const payload = { userId, department, designation };
      console.log('Payload for update:', payload);

      const response = await fetch(`${API_URL}/api/users/update-professional`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Professional details updated successfully.');
        if (onGoBack) onGoBack();
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to update professional details.');
      }
    } catch (error) {
      console.error('Error updating professional details:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Professional Details</Text>
      </View>

      <Text style={styles.label}>Designation</Text>
      <TextInput
        style={styles.input}
        value={designation}
        onChangeText={setDesignation}
        placeholder="Enter your designation"
      />

      <Text style={styles.label}>Professional Summary</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={department}
        onChangeText={setDepartment}
        placeholder="Write your professional summary here"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      <Button title="Save" onPress={handleSave} containerStyle={{ marginTop: 30 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    marginTop: 8,
    fontSize: 16,
  },
  textArea: {
    height: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
