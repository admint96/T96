import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from 'react-native-elements';
import {API_URL} from '../../config';
import Icon from 'react-native-vector-icons/Ionicons';


export function EditEmploymentDetailsScreen({ route, navigation }) {
  const { mode = 'add', employment = {}, token } = route.params || {};
  console.log('dd', route.params);
  const emp=employment;
  const [companyName, setCompanyName] = useState(emp.company || '');
  const [jobTitleName, setJobTitleName] = useState(emp.jobTitle || '');
  const [fixedPay, setFixedPay] = useState(
    emp.currentSalary?.fixedPay ? String(emp.currentSalary.fixedPay) : ''
  );
  const [variablePay, setVariablePay] = useState(
    emp.currentSalary?.variablePay ? String(emp.currentSalary.variablePay) : ''
  );
  const [isCurrentCompany, setIsCurrentCompany] = useState(emp.isCurrentCompany || false);
  const [isOngoing, setIsOngoing] = useState(emp.isOngoing || false);
  const [payType, setPayType] = useState(emp.payType || 'fixed');
  const [startDate, setStartDate] = useState(emp.startDate ? new Date(emp.startDate) : new Date());
  const [endDate, setEndDate] = useState(emp.endDate ? new Date(emp.endDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [experience, setExperience] = useState(emp.experience || '');
  const [projects, setProjects] = useState(
    Array.isArray(emp.projects) ? emp.projects.join(', ') : ''
  );
  const [responsibilities, setResponsibilities] = useState(
    Array.isArray(emp.responsibilities) ? emp.responsibilities.join(', ') : ''
  );

  const toggleCurrentCompany = () => setIsCurrentCompany(prev => !prev);
  const toggleOngoing = () => setIsOngoing(prev => !prev);

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(null);
    if (selectedDate) {
      if (showDatePicker === 'start') {
        setStartDate(selectedDate);
      } else if (showDatePicker === 'end') {
        setEndDate(selectedDate);
      }
    }
  };

  const showPicker = picker => setShowDatePicker(picker);

  const handleSave = async () => {
    const fixedPayNum = Number(fixedPay);
    const variablePayNum = Number(variablePay);

    if (isNaN(fixedPayNum) || fixedPayNum < 0) {
      alert('Please enter a valid fixed pay amount.');
      return;
    }

    if (payType === 'fixed+variable' && (isNaN(variablePayNum) || variablePayNum < 0)) {
      alert('Please enter a valid variable pay amount.');
      return;
    }

    const employmentDetails = {
      company: companyName,
      jobTitle: jobTitleName,
      currentSalary: {
        fixedPay: fixedPayNum,
        variablePay: payType === 'fixed+variable' ? variablePayNum : 0,
      },
      startDate: startDate.toISOString().split('T')[0],
      endDate: isOngoing ? null : endDate.toISOString().split('T')[0],
      isCurrentCompany,
      isOngoing,
      payType,
      experience,
      projects: projects.split(',').map(p => p.trim()).filter(Boolean),
      responsibilities: responsibilities.split(',').map(r => r.trim()).filter(Boolean),
    };

    if (mode === 'edit') {
      employmentDetails.id = emp._id || emp.id;
    }

    try {
      const url =
        mode === 'edit'
          ? `${API_URL}/api/users/update-employment`
          : `${API_URL}/api/users/add-employment`;

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(employmentDetails),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Response not JSON:', text);
        alert('Server Error: Unexpected response format');
        return;
      }

      if (response.ok) {
        alert(`Employment details ${mode === 'edit' ? 'updated' : 'saved'} successfully!`);
        navigation.goBack();
      } else {
        alert('Failed to save: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error: ' + error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Icon name="arrow-back" size={24} color="#000" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Update Employment Details</Text>
</View>
     <Text style={styles.label}>Company</Text>
      <TextInput
        style={styles.input}
        value={companyName}
        onChangeText={setCompanyName}
        placeholder="Enter company name"
        placeholderTextColor="#555"
      />

      <Text style={styles.label}>Job Title</Text>
      <TextInput
        style={styles.input}
        value={jobTitleName}
        onChangeText={setJobTitleName}
        placeholder="Enter job title"
        placeholderTextColor="#555"
      />

      <Text style={styles.label}>Is this your current company?</Text>
      <View style={styles.switchRow}>
        <Text>{isCurrentCompany ? 'Yes' : 'No'}</Text>
        <Switch value={isCurrentCompany} onValueChange={toggleCurrentCompany} />
      </View>

      <Text style={styles.label}>Experience</Text>
      <TextInput
        style={styles.input}
        value={experience}
        onChangeText={setExperience}
        placeholder="E.g. 2 years 6 months"
        placeholderTextColor="#555"
      />

      <Text style={styles.label}>Projects</Text>
      <TextInput
        style={[styles.input, styles.multiLine]}
        value={projects}
        onChangeText={setProjects}
        placeholder="Comma-separated project names"
        multiline
        numberOfLines={3}
        placeholderTextColor="#555"
      />

      <Text style={styles.label}>Responsibilities</Text>
      <TextInput
        style={[styles.input, styles.multiLine]}
        value={responsibilities}
        onChangeText={setResponsibilities}
        placeholder="Comma-separated responsibilities"
        multiline
        numberOfLines={3}
        placeholderTextColor="#555"
      />

      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => showPicker('start')}>
        <Text>{startDate.toDateString()}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>End Date</Text>
      <View style={styles.switchRow}>
        <Text>{isOngoing ? 'Ongoing' : endDate.toDateString()}</Text>
        <Switch value={isOngoing} onValueChange={toggleOngoing} />
      </View>

      {!isOngoing && (
        <TouchableOpacity style={styles.dateInput} onPress={() => showPicker('end')}>
          <Text>{endDate.toDateString()}</Text>
        </TouchableOpacity>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === 'start' ? startDate : endDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

      <Text style={styles.label}>Pay Type</Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity style={styles.radioOption} onPress={() => setPayType('fixed')}>
          <View style={[styles.radioCircle, payType === 'fixed' && styles.selectedRadio]} />
          <Text style={styles.radioLabel}>Fixed Pay Only</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => setPayType('fixed+variable')}>
          <View
            style={[styles.radioCircle, payType === 'fixed+variable' && styles.selectedRadio]}
          />
          <Text style={styles.radioLabel}>Fixed + Variable Pay</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Fixed Pay</Text>
      <TextInput
        style={styles.input}
        value={fixedPay}
        onChangeText={setFixedPay}
        placeholder="Enter fixed pay"
        keyboardType="numeric"
        placeholderTextColor="#555"
      />

      {payType === 'fixed+variable' && (
        <>
          <Text style={styles.label}>Variable Pay</Text>
          <TextInput
            style={styles.input}
            value={variablePay}
            onChangeText={setVariablePay}
            placeholder="Enter variable pay"
            keyboardType="numeric"
            placeholderTextColor="#555"
          />
        </>
      )}

      <Button title="Save" onPress={handleSave} containerStyle={{ marginTop: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    color: 'black',
  },
  multiLine: {
    textAlignVertical: 'top',
    height: 100,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dateInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  radioGroup: {
    marginVertical: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#555',
    marginRight: 8,
  },
  selectedRadio: {
    backgroundColor: '#555',
  },
  radioLabel: {
    fontSize: 14,
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
