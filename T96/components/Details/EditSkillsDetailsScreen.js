import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../config';
import Icon from 'react-native-vector-icons/Ionicons';




const COMMON_SKILLS = [
  'JavaScript', 'React', 'React Native', 'Node.js', 'Express', 'Python', 'Django',
  'Flask', 'Java', 'Spring Boot', 'C++', 'C#', 'SQL', 'MongoDB', 'AWS', 'Azure',
  'Docker', 'Kubernetes', 'HTML', 'CSS', 'TypeScript', 'GraphQL', 'Git',
  'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Agile Methodology',
  'Swift', 'Kotlin', 'Objective-C', 'PHP', 'Laravel', 'Ruby', 'Rails', 'Go',
  'Rust', 'TensorFlow', 'PyTorch', 'Data Science', 'DevOps', 'Linux',
  'Blockchain', 'Cybersecurity', 'Cloud Computing', 'Microservices',
  'NoSQL', 'Redux', 'Jest', 'Mocha', 'Selenium', 'JUnit', 'Firebase',
  'REST API', 'SOAP', 'Apache Kafka', 'ElasticSearch', 'Apache Spark',
  'Big Data', 'Hadoop', 'Tableau', 'Power BI', 'SEO', 'Content Writing',
  'Digital Marketing', 'Salesforce', 'CRM', 'Business Analysis',
];

export function EditSkillsDetailsScreen({ route, navigation }) {
  const { skills: initialSkills = [] } = route.params || {};
  const [skills, setSkills] = useState(initialSkills);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem('token').then((value) => {
      if (value) setToken(value);
    });
  }, []);

  useEffect(() => {
    if (newSkill.trim() === '') {
      setFilteredSuggestions([]);
      return;
    }
    const filtered = COMMON_SKILLS.filter(skill =>
      skill.toLowerCase().startsWith(newSkill.toLowerCase()) &&
      !skills.includes(skill)
    );
    setFilteredSuggestions(filtered);
  }, [newSkill, skills]);

  const addSkill = () => {
    const skillTrimmed = newSkill.trim();
    if (skillTrimmed && !skills.includes(skillTrimmed)) {
      setSkills([...skills, skillTrimmed]);
      setNewSkill('');
      setFilteredSuggestions([]);
    } else if (skills.includes(skillTrimmed)) {
      Alert.alert('Duplicate Skill', 'This skill is already added.');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ API_URL }/api/users/update-skills`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skills }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Update failed');

      Alert.alert('Success', 'Skills updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Icon name="arrow-back" size={24} color="#000" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Update Skills</Text>
</View>
      <Text style={styles.label}>Add New Skill</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={newSkill}
          onChangeText={setNewSkill}
          placeholder="e.g. JavaScript"
          onSubmitEditing={addSkill}
          returnKeyType="done"
          editable={!loading}
        />
        <TouchableOpacity style={styles.addButton} onPress={addSkill} disabled={loading || !newSkill.trim()}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {filteredSuggestions.map((suggestion, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setSkills([...skills, suggestion]);
                setNewSkill('');
                setFilteredSuggestions([]);
              }}
              style={styles.suggestionItem}
            >
              <Text>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={[styles.label, { marginTop: 20 }]}>Current Skills</Text>
      <View style={styles.skillsContainer}>
        {skills.length === 0 && <Text style={styles.noSkillsText}>No skills added yet.</Text>}
        {skills.map((skill, index) => (
          <View key={index} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
            <TouchableOpacity onPress={() => removeSkill(skill)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Button
        title={loading ? 'Saving...' : 'Save'}
        onPress={handleSave}
        disabled={loading}
        containerStyle={{ marginTop: 30 }}
      />
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginLeft: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillBadge: {
    flexDirection: 'row',
    backgroundColor: '#4a90e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  skillText: {
    color: 'white',
    fontSize: 14,
  },
  removeBtn: {
    marginLeft: 8,
  },
  removeBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 18,
  },
  noSkillsText: {
    fontStyle: 'italic',
    color: '#999',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    maxHeight: 120,
    marginTop: 4,
    marginHorizontal: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
