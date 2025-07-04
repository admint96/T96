import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../config';
import Icon from 'react-native-vector-icons/Ionicons';


export default function EditEducationDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  
  const existingEducation = route.params?.edu || null;
  console.log('existingEducation:', existingEducation);

  
  const isEditMode = existingEducation && (existingEducation._id || existingEducation.id);

  const [qualification, setQualification] = useState('');
  const [course, setCourse] = useState('');
  const [customCourse, setCustomCourse] = useState('');
  const [college, setCollege] = useState('');
  const [grading, setGrading] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [courseType, setCourseType] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');

  
  const [board, setBoard] = useState('');
  const [medium, setMedium] = useState('');
  const [percentage, setPercentage] = useState('');
  const [yearOfPassing, setYearOfPassing] = useState('');

 
  const [showBoardSuggestions, setShowBoardSuggestions] = useState(false);
  const [showMediumSuggestions, setShowMediumSuggestions] = useState(false);

  const [yearPickerVisible, setYearPickerVisible] = useState(false);
  const [yearPickerTarget, setYearPickerTarget] = useState(null);
  const [token, setToken] = useState(null);

  const currentYear = new Date().getFullYear();
  const startYears = Array.from({ length: currentYear - 1999 }, (_, i) => (currentYear - i).toString());

  
  useEffect(() => {
    async function fetchToken() {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
    }
    fetchToken();
  }, []);

  
  useEffect(() => {
    if (isEditMode) {
      const edu = existingEducation;
      setQualification(edu.qualification || '');
      setCourse(edu.course || '');
      setCustomCourse(edu.course || '');
      setCollege(edu.college || '');
      setGrading(edu.grading || '');
      setCgpa(edu.cgpa || '');
      setCourseType(edu.courseType || '');
      setStartYear(edu.startYear || '');
      setEndYear(edu.endYear || '');

      setBoard(edu.board || '');
      setMedium(edu.medium || '');
      setPercentage(edu.percentage || '');
      setYearOfPassing(edu.yearOfPassing || '');
    }
  }, [existingEducation]);

  const qualifications = ['Class X', 'Class XII', 'Graduate', 'Post Graduate', 'Doctorate'];
  const courses = {
    'Graduate': ['B.Tech/B.E.', 'B.Ed', 'B.Pharma', 'BHM', 'Other'],
    'Post Graduate': ['M.Des.', 'DM', 'MDS', 'Other'],
    'Doctorate': ['Ph.D', 'D.Sc', 'D.Litt', 'Other'],
  };
  const gradingOptions = ['GPA out of 10', 'GPA out of 4', 'Percentage', 'Course requires a pass'];
  const courseTypes = ['Full time', 'Part time', 'Correspondence'];

  const examBoards = [
    'CBSE',
    'CISCE (ICSE/ISC)',
    'National Institute of Open Schooling',
    'Telangana State Board',
    'Andhra Pradesh Board',
    'Karnataka State Board',
    'Maharashtra State Board',
    'Tamil Nadu State Board',
    'Kerala State Board',
    'Other',
  ];
  const mediums = [
    'English',
    'Hindi',
    'Telugu',
    'Tamil',
    'Kannada',
    'Malayalam',
    'Marathi',
    'Bengali',
    'Gujarati',
    'Urdu',
    'Punjabi',
    'Odia',
    'Assamese',
    'Sanskrit',
    'Other',
  ];

  
  const filteredBoards = examBoards.filter(
    (b) => b.toLowerCase().includes(board.toLowerCase()) && board.trim() !== ''
  );
  const filteredMediums = mediums.filter(
    (m) => m.toLowerCase().includes(medium.toLowerCase()) && medium.trim() !== ''
  );

  const getEndYears = () => {
    if (!startYear) return [];
    const start = Number(startYear);
    const end = start + 7;
    return Array.from({ length: end - start + 1 }, (_, i) => (start + i).toString());
  };

  const openYearPicker = (target) => {
    setYearPickerTarget(target);
    setYearPickerVisible(true);
  };

  const selectYear = (year) => {
    if (yearPickerTarget === 'start') {
      setStartYear(year);
      setEndYear('');
    } else if (yearPickerTarget === 'end') {
      setEndYear(year);
    } else if (yearPickerTarget === 'passing') {
      setYearOfPassing(year);
    }
    setYearPickerVisible(false);
  };

  const isSaveEnabled =
    (qualification === 'Class X' || qualification === 'Class XII')
      ? board && medium && percentage && yearOfPassing
      : qualification &&
        course &&
        (course !== 'Other' || customCourse) &&
        college &&
        grading &&
        (grading === 'Course requires a pass' || cgpa) &&
        courseType &&
        startYear &&
        endYear;

  const handleSave = async () => {
    if (!token) {
      Alert.alert('Error', 'User not authenticated. Please login.');
      return;
    }

    const data =
      qualification === 'Class X' || qualification === 'Class XII'
        ? {
            qualification,
            board,
            medium,
            percentage,
            yearOfPassing,
            ...(isEditMode && { id: existingEducation._id || existingEducation.id }),
          }
        : {
            qualification,
            course: course === 'Other' ? customCourse : course,
            college,
            grading,
            cgpa: grading === 'Course requires a pass' ? null : cgpa,
            courseType,
            startYear,
            endYear,
            ...(isEditMode && { id: existingEducation._id || existingEducation.id }),
          };

    console.log('Sending education data:', data);

    try {
      const url = isEditMode
        ? `${ API_URL }/api/users/update-education`
        : `${ API_URL }/api/users/add-education`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log('API response status:', response.status);
      const respText = await response.text();
      console.log('API response text:', respText);

      if (response.ok) {
        Alert.alert('Success', 'Education details saved successfully.');
        navigation.goBack();
      } else {
        let errorData = {};
        try {
          errorData = JSON.parse(respText);
        } catch {}
        Alert.alert('Error', errorData.message || 'Failed to save details.');
      }
    } catch (error) {
      console.error('Network error:', error);
      Alert.alert('Error', 'Network error.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      

<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Icon name="arrow-back" size={24} color="#000" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Update Education</Text>
</View>
       

        <Text style={styles.label}>Qualification</Text>
        <View style={styles.optionsRow}>
          {qualifications.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.optionButton, qualification === item && styles.selectedButton]}
              onPress={() => {
                setQualification(item);
                setCourse('');
                setCustomCourse('');
                setBoard('');
                setMedium('');
                setPercentage('');
                setYearOfPassing('');
                setShowBoardSuggestions(false);
                setShowMediumSuggestions(false);
              }}
            >
              <Text style={styles.optionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {(qualification === 'Class X' || qualification === 'Class XII') && (
          <>
            <Text style={styles.label}>Examination Board</Text>
            <View style={{ marginBottom: 5 }}>
              <TextInput
                style={styles.input}
                placeholder="Search Examination Board"
                value={board}
                onChangeText={(text) => {
                  setBoard(text);
                  setShowBoardSuggestions(true);
                }}
                onFocus={() => setShowBoardSuggestions(true)}
                onBlur={() => {
                 
                  setTimeout(() => setShowBoardSuggestions(false), 100);
                }}
                autoCorrect={false}
              />
              {showBoardSuggestions && filteredBoards.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={{ maxHeight: 120 }}>
                    {filteredBoards.map((item) => (
                      <TouchableOpacity
                        key={item}
                        onPress={() => {
                          setBoard(item);
                          setShowBoardSuggestions(false);
                        }}
                        style={styles.suggestionItem}
                      >
                        <Text>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <Text style={styles.label}>Medium of Study</Text>
            <View style={{ marginBottom: 5 }}>
              <TextInput
                style={styles.input}
                placeholder="Search Medium of Study"
                value={medium}
                onChangeText={(text) => {
                  setMedium(text);
                  setShowMediumSuggestions(true);
                }}
                onFocus={() => setShowMediumSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowMediumSuggestions(false), 100);
                }}
                autoCorrect={false}
              />
              {showMediumSuggestions && filteredMediums.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={{ maxHeight: 120 }}>
                    {filteredMediums.map((item) => (
                      <TouchableOpacity
                        key={item}
                        onPress={() => {
                          setMedium(item);
                          setShowMediumSuggestions(false);
                        }}
                        style={styles.suggestionItem}
                      >
                        <Text>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <Text style={styles.label}>Percentage</Text>
            <TextInput
              style={styles.input}
              placeholder="Percentage"
              keyboardType="numeric"
              value={percentage}
              onChangeText={setPercentage}
            />

            <Text style={styles.label}>Year of Passing</Text>
            <TouchableOpacity onPress={() => openYearPicker('passing')} style={styles.yearInput}>
              <Text style={yearOfPassing ? styles.yearText : styles.yearPlaceholder}>
                {yearOfPassing || 'Select Year'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {qualification &&
          qualification !== 'Class X' &&
          qualification !== 'Class XII' &&
          courses[qualification] && (
            <>
              <Text style={styles.label}>Course Name</Text>
              <View style={styles.optionsRow}>
                {courses[qualification].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.optionButton, course === item && styles.selectedButton]}
                    onPress={() => {
                      setCourse(item);
                      if (item !== 'Other') setCustomCourse('');
                    }}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {course === 'Other' && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter custom course"
                  value={customCourse}
                  onChangeText={setCustomCourse}
                />
              )}

              <Text style={styles.label}>College Name</Text>
              <TextInput style={styles.input} value={college} onChangeText={setCollege} placeholder="College" />

              <Text style={styles.label}>Grading</Text>
              <View style={styles.optionsRow}>
                {gradingOptions.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.optionButton, grading === item && styles.selectedButton]}
                    onPress={() => {
                      setGrading(item);
                      if (item === 'Course requires a pass') setCgpa('');
                    }}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {(grading === 'GPA out of 10' || grading === 'GPA out of 4' || grading === 'Percentage') && (
                <TextInput
                  style={styles.input}
                  placeholder={`Enter ${grading}`}
                  keyboardType="numeric"
                  value={cgpa}
                  onChangeText={setCgpa}
                />
              )}

              <Text style={styles.label}>Start Year</Text>
              <TouchableOpacity style={styles.yearInput} onPress={() => openYearPicker('start')}>
                <Text style={startYear ? styles.yearText : styles.yearPlaceholder}>{startYear || 'Select Start Year'}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>End Year</Text>
              <TouchableOpacity
                style={[styles.yearInput, !startYear && { opacity: 0.5 }]}
                onPress={() => startYear && openYearPicker('end')}
                disabled={!startYear}
              >
                <Text style={endYear ? styles.yearText : styles.yearPlaceholder}>{endYear || 'Select End Year'}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Course Type</Text>
              <View style={styles.optionsRow}>
                {courseTypes.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.optionButton, courseType === item && styles.selectedButton]}
                    onPress={() => setCourseType(item)}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.saveButton, !isSaveEnabled && styles.disabledButton]}
            disabled={!isSaveEnabled}
            onPress={handleSave}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={yearPickerVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Year</Text>
              <FlatList
                data={
                  yearPickerTarget === 'start'
                    ? startYears
                    : yearPickerTarget === 'end'
                    ? getEndYears()
                    : startYears
                }
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.yearItem} onPress={() => selectYear(item)}>
                    <Text style={styles.yearItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 300 }}
              />
              <TouchableOpacity style={styles.closeButton} onPress={() => setYearPickerVisible(false)}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 6,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  yearInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  yearText: {
    fontSize: 16,
    color: '#000',
  },
  yearPlaceholder: {
    fontSize: 16,
    color: '#888',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    marginRight: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  selectedButton: {
    backgroundColor: '#007BFF',
    borderColor: '#0056b3',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 48, 
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    maxHeight: 120,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  buttonRow: {
    marginTop: 30,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  yearItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  yearItemText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#007BFF',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
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
