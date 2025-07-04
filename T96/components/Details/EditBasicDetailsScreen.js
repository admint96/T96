import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import {API_URL} from '../../config';
import Icon from 'react-native-vector-icons/Ionicons';

export default function EditBasicDetailsScreen({ route, navigation }) {
  const {
    token,
    location: initialLocation = '',
    experiences: initialExperiences = '',
    ctc: initialCtc = '',
    expectedctc: initialExpectedCtc = '', 
    noticePeriod: initialNoticePeriod = '',
    currentlyServingNotice: initialCurrentlyServingNotice = false,
    noticeEndDate: initialNoticeEndDate = new Date(),
    onGoBack,
  } = route.params || {};

  const [location, setLocation] = useState(initialLocation);
  const [experiences, setExperiences] = useState(initialExperiences);
  const [ctc, setCtc] = useState(initialCtc);
  const [expectedCtc, setExpectedCtc] = useState(initialExpectedCtc);
  const [noticePeriod, setNoticePeriod] = useState(initialNoticePeriod);
  const [isServingNotice, setIsServingNotice] = useState(initialCurrentlyServingNotice);
  const [noticeEndDate, setNoticeEndDate] = useState(new Date(initialNoticeEndDate));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || noticeEndDate;
    setShowDatePicker(false);
    setNoticeEndDate(currentDate);
  };

  const handleSave = async () => {
    if (!location.trim()) {
      Alert.alert('Validation Error', 'Location cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/update-basic`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location,
          experiences,
          ctc,
          expectedCtc, 
          noticePeriod,
          currentlyServingNotice: isServingNotice,
          noticeEndDate: isServingNotice ? noticeEndDate.toISOString() : null,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        Alert.alert('Error', result.message || 'Something went wrong');
        return;
      }

      if (onGoBack) {
        onGoBack({
          location,
          experiences,
          ctc,
          expectedCtc,
          noticePeriod,
          currentlyServingNotice: isServingNotice,
          noticeEndDate: isServingNotice ? noticeEndDate.toISOString() : null,
        });
      }

      Alert.alert('Success', 'Details updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update details');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Basic Details</Text>
      </View>

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Enter your location"
      />

      <Text style={styles.label}>Experiences</Text>
      <TextInput
        style={styles.input}
        value={experiences}
        onChangeText={setExperiences}
        placeholder="Enter your experience"
      />

      <Text style={styles.label}>CTC</Text>
      <TextInput
        style={styles.input}
        value={ctc}
        onChangeText={setCtc}
        placeholder="Enter your CTC"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Expected CTC</Text>
      <TextInput
        style={styles.input}
        value={expectedCtc}
        onChangeText={setExpectedCtc}
        placeholder="Enter your expected CTC"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Notice Period</Text>
      <RNPickerSelect
        onValueChange={value => setNoticePeriod(value)}
        placeholder={{ label: 'Select Notice Period', value: '' }}
        items={[
          { label: '0 - 15 Days', value: '0-15' },
          { label: '1 Month', value: '30' },
          { label: '2 Months', value: '60' },
          { label: '3 Months', value: '90' },
        ]}
        value={noticePeriod}
        style={pickerStyles}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.labelInline}>Currently Serving Notice</Text>
        <TouchableOpacity
          onPress={() => setIsServingNotice(prev => !prev)}
          style={[
            styles.toggle,
            isServingNotice ? styles.toggleOn : styles.toggleOff,
          ]}
        >
          <View
            style={[
              styles.toggleCircle,
              isServingNotice ? styles.toggleCircleOn : styles.toggleCircleOff,
            ]}
          />
        </TouchableOpacity>
      </View>

      {isServingNotice && (
        <View>
          <Text style={styles.label}>Notice End Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.input}
          >
            <Text>{noticeEndDate.toDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={noticeEndDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
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
    fontWeight: '600',
    marginTop: 10,
  },
  labelInline: {
    fontWeight: '600',
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 45,
    justifyContent: 'center',
    marginBottom: 10,
  },
  switchContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggle: {
    width: 36,
    height: 18,
    borderRadius: 10,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#87CEFA',
    alignItems: 'flex-end',
  },
  toggleOff: {
    backgroundColor: '#ccc',
    alignItems: 'flex-start',
  },
  toggleCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
  },
  saveBtn: {
    marginTop: 20,
    backgroundColor: '#0066ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
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

const pickerStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 10,
    color: 'black',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 10,
    color: 'black',
  },
};
