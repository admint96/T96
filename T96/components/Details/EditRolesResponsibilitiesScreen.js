import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import {API_URL} from '../../config';
const COMMON_ROLES = [
  'Project Management',
  'Team Leadership',
  'Client Communication',
  'Quality Assurance',
  'Technical Documentation',
  'Code Review',
  'Software Development',
  'Requirement Analysis',
  'Product Design',
  'Testing & Debugging',
  'System Architecture',
  'Deployment',
  'Customer Support',
  'Training & Mentoring',
  'Performance Optimization',
  'Budget Management',
  'Risk Assessment',
  'Stakeholder Engagement',
  'Resource Allocation',
  'Process Improvement',
  'Data Analysis',
  'Market Research',
  'Strategic Planning',
  'Quality Control',
  'Vendor Management',
  'Compliance Monitoring',
  'Technical Support',
  'Incident Management',
  'Change Management',
  'Documentation Management',
  'Security Management',
  'Business Development',
  'Contract Negotiation',
  'Software Integration',
  'Product Launch',
  'User Training',
  'System Maintenance',
  'Audit Preparation',
  'Customer Relationship Management',
  'Performance Reviews',
  'Collaboration',
  'Problem Solving',
  'Innovation',
  'Presentation',
  'Scheduling',
  'Budget Forecasting',
  'Testing Automation',
  'Continuous Integration',
  'Reporting',
];


export function EditRolesResponsibilitiesScreen({ route, navigation }) {
  const { rolesSummary = '', token = '' } = route.params || {};

  const [roles, setRoles] = useState('');
  const [roleList, setRoleList] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (rolesSummary) {
      const initialRoles = rolesSummary
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
      setRoleList(initialRoles);
    }
  }, [rolesSummary]);

  
  const lastTypedRole = roles.split(',').pop().trim();

  
  const filteredSuggestions = lastTypedRole.length > 0
    ? COMMON_ROLES.filter(
        (role) =>
          role.toLowerCase().startsWith(lastTypedRole.toLowerCase()) &&
          !roleList.includes(role)
      )
    : [];

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${ API_URL }/api/users/update-roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ summaries: roleList }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update roles');
      }

      Alert.alert('Success', 'Roles & Responsibilities updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = () => {
    const newRoles = roles
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');

    const uniqueRoles = Array.from(new Set([...roleList, ...newRoles]));
    setRoleList(uniqueRoles);
    setRoles('');
  };

  
  const addSuggestion = (suggestion) => {
    if (!roleList.includes(suggestion)) {
      setRoleList((prev) => [...prev, suggestion]);
    }
    
    const parts = roles.split(',');
    parts.pop(); 
    setRoles(parts.length > 0 ? parts.join(', ') + ', ' : '');
  };

  const removeRole = (index) => {
    const updatedList = [...roleList];
    updatedList.splice(index, 1);
    setRoleList(updatedList);
    setRoles('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Roles & Responsibilities</Text>

      <TextInput
        style={[styles.input, { height: 50, textAlignVertical: 'top' }]}
        value={roles}
        onChangeText={setRoles}
        multiline
        placeholder="Enter comma-separated responsibilities"
        editable={!loading}
        autoCorrect={false}
      />

      {/* Suggestions dropdown */}
      {filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {filteredSuggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              onPress={() => addSuggestion(suggestion)}
              style={styles.suggestionItem}
            >
              <Text>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Button
        title="Add Roles"
        onPress={handleAddRole}
        disabled={loading || !roles.trim()}
        containerStyle={styles.buttonContainer}
      />

      <Button
        title={loading ? 'Saving...' : 'Save'}
        onPress={handleSave}
        disabled={loading || roleList.length === 0}
        containerStyle={styles.buttonContainer}
        buttonStyle={{ backgroundColor: '#4CAF50' }}
      />

      {roleList.length > 0 && (
        <View style={styles.rolesContainer}>
          {roleList.map((role, index) => (
            <View key={index} style={styles.badge}>
              <Text style={styles.badgeText}>{role}</Text>
              <TouchableOpacity onPress={() => removeRole(index)}>
                <Icon name="close-circle" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    marginTop: 20,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 10,
  },
  badgeText: {
    color: '#fff',
    marginRight: 6,
    fontSize: 14,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 150,
    marginTop: 6,
    borderRadius: 5,
    paddingVertical: 4,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 3,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
