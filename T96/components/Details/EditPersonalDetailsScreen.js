import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import {API_URL} from '../../config'; 
import Icon from 'react-native-vector-icons/Ionicons';

const COMMON_LANGUAGES = [
  'English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam',
  'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu', 'Odia',
  'Assamese', 'Sanskrit', 'French', 'Spanish', 'German',
  'Chinese', 'Japanese', 'Russian',
];

export default function EditPersonalDetailsScreen({ route, navigation }) {
  const [address, setAddress] = useState('');
  const [disability, setDisability] = useState(false);
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [languages, setLanguages] = useState([]);
  const [langInput, setLangInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params) {
      const {
        address: add,
        isDisabled: dis,
        languages: lan,
        dob: dobParam,
        gender: gen,
        maritalStatus: ms,
      } = route.params;

      setAddress(add || '');
      setDisability(!!dis);
      setDob(dobParam ? new Date(dobParam) : new Date());
      setGender(gen || '');
      setMaritalStatus(ms || '');

      if (Array.isArray(lan)) {
        const normalizedLanguages = lan.map((lang) =>
          typeof lang === 'string'
            ? {
                language: lang,
                proficiency: 'Beginner',
                canRead: false,
                canWrite: false,
                canSpeak: false,
              }
            : {
                ...lang,
                canRead: lang.canRead ?? false,
                canWrite: lang.canWrite ?? false,
                canSpeak: lang.canSpeak ?? false,
              }
        );
        setLanguages(normalizedLanguages);
      } else {
        setLanguages([]);
      }
    }
  }, [route.params]);

  const filteredSuggestions = COMMON_LANGUAGES.filter(
    (lang) =>
      lang.toLowerCase().startsWith(langInput.toLowerCase()) &&
      !languages.some((l) => l.language.toLowerCase() === lang.toLowerCase())
  );

  const addLanguage = (languageToAdd) => {
    const trimmed = languageToAdd.trim();
    if (
      trimmed &&
      !languages.some((l) => l.language.toLowerCase() === trimmed.toLowerCase())
    ) {
      setLanguages((prev) => [
        ...prev,
        {
          language: trimmed,
          proficiency: 'Beginner',
          canRead: false,
          canWrite: false,
          canSpeak: false,
        },
      ]);
      setLangInput('');
    }
  };

  const handleLanguageUpdate = (index, updatedLang) => {
    const updatedList = [...languages];
    updatedList[index] = updatedLang;
    setLanguages(updatedList);
  };

  const handleRemoveLanguage = (index, langName) => {
    Alert.alert(
      'Confirm',
      `Remove ${langName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedLanguages = languages.filter((_, i) => i !== index);
            setLanguages(updatedLanguages);
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!gender || !maritalStatus || !address) {
      Alert.alert('Error', 'Please fill all mandatory fields.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(`${API_URL}/api/users/update-personal`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address,
          disability: disability ? 'yes' : 'no',
          dob: dob.toISOString(),
          gender,
          maritalStatus,
          languages,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update personal details');
      }

      Alert.alert('Success', 'Personal details updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Personal Details</Text>
      </View>

      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity
        style={styles.datePicker}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{dob.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDob(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Gender</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={gender} onValueChange={setGender} style={{ color: '#000' }}>
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <Text style={styles.label}>Marital Status</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={maritalStatus} onValueChange={setMaritalStatus} style={{ color: '#000' }}>
          <Picker.Item label="Select Status" value="" />
          <Picker.Item label="Single" value="Single" />
          <Picker.Item label="Married" value="Married" />
        </Picker>
      </View>

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Enter your address"
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Disability</Text>
        <Switch
          value={disability}
          onValueChange={setDisability}
          thumbColor={disability ? '#007bff' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </View>

      <Text style={styles.label}>Languages</Text>
      <View style={styles.languageInputContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          placeholder="Add a language"
          value={langInput}
          onChangeText={setLangInput}
          onSubmitEditing={() => addLanguage(langInput)}
        />
        <Button title="Add" onPress={() => addLanguage(langInput)} />
      </View>

      {langInput.length > 0 && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {filteredSuggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              onPress={() => addLanguage(suggestion)}
              style={styles.suggestionItem}
            >
              <Text>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {languages.map((lang, index) => (
        <View key={`${lang.language}-${index}`} style={styles.languageBox}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('EditLanguage', {
                lang,
                index,
                onSave: (i, updatedLang) => handleLanguageUpdate(i, updatedLang),
              })
            }
            style={{ flex: 1 }}
          >
            <Text style={styles.languageHeader}>{lang.language}</Text>
            <Text style={styles.languageDetail}>Proficiency: {lang.proficiency}</Text>
            <View style={styles.abilitiesRow}>
              {lang.canRead && <Text style={styles.abilityTag}>Read</Text>}
              {lang.canWrite && <Text style={styles.abilityTag}>Write</Text>}
              {lang.canSpeak && <Text style={styles.abilityTag}>Speak</Text>}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleRemoveLanguage(index, lang.language)}
            style={styles.removeButton}
          >
<Icon name="close-circle" size={20} color="#fff" />


          </TouchableOpacity>
        </View>
      ))}

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
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 8,
    backgroundColor: '#fafafa',
    color: 'black',
  },
  datePicker: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fafafa',
    marginTop: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 8,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
    ...Platform.select({
      android: {
        height: 50,
        justifyContent: 'center',
      },
    }),
  },
  switchRow: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageInputContainer: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 120,
    marginTop: 4,
    borderRadius: 5,
    paddingVertical: 4,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  languageBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: '#f9f9f9',
    position: 'relative',
  },
  languageHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  languageDetail: {
    marginTop: 4,
    color: '#555',
  },
  abilitiesRow: {
    flexDirection: 'row',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  abilityTag: {
    backgroundColor: '#e0e0e0',
    color: '#333',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
    marginTop: 4,
    fontSize: 13,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e74c3c',
    padding: 2,
    borderRadius: 20,
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
