import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {API_URL} from '../../../../config';

const predefinedSuggestions = [
  // Languages & Technologies
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'R', 'MATLAB', 'SQL', 'NoSQL', 'GraphQL',

  // Frontend Frameworks
  'React.js', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Tailwind CSS', 'Bootstrap',

  // Backend Frameworks
  'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'ASP.NET',

  // Mobile Development
  'React Native', 'Flutter', 'SwiftUI', 'Android Developer', 'iOS Developer',

  // DevOps & Cloud
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform',
  'CI/CD', 'Jenkins', 'Ansible', 'GitHub Actions', 'GitLab CI',

  // AI / ML / Data
  'Machine Learning', 'Deep Learning', 'AI Engineer', 'Data Scientist',
  'Data Analyst', 'MLOps', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch',
  'Pandas', 'NumPy', 'Scikit-learn', 'Data Engineer', 'Big Data',

  // Web & Software Roles
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Software Engineer', 'Web Developer', 'QA Engineer', 'Automation Tester',
  'SDET', 'Technical Support', 'System Administrator',

  // Design & Creative
  'UI/UX Designer', 'Graphic Designer', 'Product Designer', 'Figma', 'Adobe XD',
  'Photoshop', 'Illustrator', 'Canva',

  // Management & Business
  'Product Manager', 'Project Manager', 'Business Analyst', 'Scrum Master',
  'Technical Lead', 'Engineering Manager', 'CTO', 'HR Manager', 'Talent Acquisition',

  // Popular Companies (India + Global)
  'TCS', 'Infosys', 'Wipro', 'Capgemini', 'Cognizant', 'Tech Mahindra',
  'IBM', 'Accenture', 'Amazon', 'Microsoft', 'Google', 'Meta', 'Salesforce',
  'Oracle', 'HCL', 'Zoho', 'SAP', 'LTIMindtree', 'EY', 'Deloitte', 'PwC', 'KPMG',

  // Others & Niche
  'Cybersecurity', 'Blockchain', 'IoT', 'AR/VR Developer', 'Game Developer',
  'Technical Writer', 'Intern', 'Fresher', 'Remote Developer', 'Blogger',
  'SEO Specialist', 'Social Media Manager', 'Cloud Architect',
];

const locationSuggestions = [
  'Hyderabad', 'Bangalore', 'Pune', 'Mumbai', 'Chennai',
  'Delhi', 'Noida', 'Remote', 'Kolkata', 'Ahmedabad',
];

const JobSearchScreen = () => {
  const navigation = useNavigation();

  const [type, setType] = useState('Internships');
  const [designationText, setDesignationText] = useState('');
  const [location, setLocation] = useState('');
  const [designationSuggestions, setDesignationSuggestions] = useState([]);
  const [locationFiltered, setLocationFiltered] = useState([]);
  const [showDesignationSuggestions, setShowDesignationSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const designationInputRef = useRef(null);
  const locationInputRef = useRef(null);

  const handleDesignationChange = (text) => {
    setDesignationText(text);
    const lastTerm = text.split(',').pop().trim();

    if (lastTerm.length > 0) {
      const filtered = predefinedSuggestions
        .filter((s) => s.toLowerCase().includes(lastTerm.toLowerCase()))
        .slice(0, 5); 
      setDesignationSuggestions(filtered);
      setShowDesignationSuggestions(true);
    } else {
      setShowDesignationSuggestions(false);
    }
  };

  const handleSelectDesignation = (selectedItem) => {
    let parts = designationText.split(',');
    parts[parts.length - 1] = selectedItem;
    const updatedText = parts.map((s) => s.trim()).join(', ') + ', ';
    setDesignationText(updatedText);
    setShowDesignationSuggestions(false);

    requestAnimationFrame(() => {
      designationInputRef.current?.blur();
      designationInputRef.current?.focus();
    });
  };

  const handleLocationChange = (text) => {
    setLocation(text);
    const filtered = locationSuggestions
      .filter((l) => l.toLowerCase().startsWith(text.toLowerCase()))
      .slice(0, 5); 
    setLocationFiltered(filtered);
    setShowLocationSuggestions(true);
  };

  const handleSelectLocation = (loc) => {
    setLocation(loc);
    setShowLocationSuggestions(false);

    requestAnimationFrame(() => {
      locationInputRef.current?.blur();
      locationInputRef.current?.focus();
    });
  };

  const handleSearch = async () => {
    const designationArray = designationText
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (!designationArray.length || !location) {
      Alert.alert('Missing Info', 'Please enter designation and location.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/recruiters/search-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designation: designationArray, location, type }),
      });

      const result = await response.json();
      navigation.navigate('ResultsScreen', {
        results: result,
        designation: designationArray,
        location,
        type,
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          <Text style={styles.title}>Find opportunities for you</Text>

          <View style={styles.radioRow}>
            {['Internships', 'Jobs'].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.radioOption}
                onPress={() => setType(option)}
              >
                <View style={[styles.outerCircle, type === option && styles.outerCircleSelected]}>
                  {type === option && <View style={styles.innerCircle} />}
                </View>
                <Text style={[styles.radioLabel, type === option && styles.radioLabelSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.inputGroup, { zIndex: 2 }]}>
            <TextInput
              ref={designationInputRef}
              style={styles.input}
              placeholder="Designation, Skills, Company"
              placeholderTextColor="#999"
              value={designationText}
              onChangeText={handleDesignationChange}
            />
            {showDesignationSuggestions && designationSuggestions.length > 0 && (
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={designationSuggestions}
                keyExtractor={(item) => item}
                style={styles.suggestionsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectDesignation(item)}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

          <View style={[styles.inputGroup, { zIndex: 1 }]}>
            <TextInput
              ref={locationInputRef}
              style={styles.input}
              placeholder="Location"
              placeholderTextColor="#999"
              value={location}
              onChangeText={handleLocationChange}
            />
            {showLocationSuggestions && locationFiltered.length > 0 && (
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={locationFiltered}
                keyExtractor={(item) => item}
                style={styles.suggestionsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectLocation(item)}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>
              {type === 'Internships' ? 'Show internships' : 'Show jobs'}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  backBtn: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#000' },
  radioRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  radioOption: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  outerCircle: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#888', alignItems: 'center', justifyContent: 'center',
  },
  outerCircleSelected: { borderColor: '#1D4ED8' },
  innerCircle: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1D4ED8' },
  radioLabel: { fontSize: 14, color: '#888' },
  radioLabelSelected: { color: '#1D4ED8', fontWeight: 'bold' },
  inputGroup: { marginBottom: 16, position: 'relative' },
  input: {
    height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 16, fontSize: 14, color: '#000', backgroundColor: '#fff',
  },
  suggestionsList: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    maxHeight: 150,
    zIndex: 99,
  },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  suggestionText: { fontSize: 14, color: '#333' },
  searchButton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default JobSearchScreen;
