import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {API_URL} from '../../config';
import Toast from 'react-native-toast-message'; 
import { toastConfig } from '../pages/toastConfig';

const PostJobs = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const jobData = route.params?.jobData || null;

  const [form, setForm] = useState({
    jobTitle: '',
    companyName: '',
    companyLogo: '',
    salary: '',
    experienceType: 'Fresher',
    experienceMin: '',
    experienceMax: '',
    location: 'Remote',
    description: '',
    jobType: 'Full-time',
    recruiterEmail: '',
    openings: '',
  });

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [customLocation, setCustomLocation] = useState('');

  const skillsList = ['React.js', 'React Native', 'JavaScript', 'TypeScript', 'Node.js', 'Redux'];

  useEffect(() => {
    if (jobData) {
      const [minExp = '', maxExp = ''] =
        jobData.experience !== 'Fresher'
          ? jobData.experience.replace(' years', '').split('-')
          : [];

      const knownLocations = ['Remote', 'Hyderabad', 'Bangalore', 'Chennai', 'Mumbai'];

      setForm({
        jobTitle: jobData.jobTitle || '',
        companyName: jobData.companyName || '',
        companyLogo: jobData.companyLogo || '',
        salary: jobData.salary || '',
        experienceType: jobData.experience === 'Fresher' ? 'Fresher' : 'Experienced',
        experienceMin: minExp,
        experienceMax: maxExp,
        location: knownLocations.includes(jobData.location) ? jobData.location : 'Other',
        description: jobData.description || '',
        jobType: jobData.jobType || 'Full-time',
        recruiterEmail: jobData.recruiterEmail || '',
        openings: jobData.openings?.toString() || '',
      });

      if (!knownLocations.includes(jobData.location)) {
        setCustomLocation(jobData.location);
      }

      setSelectedSkills(jobData.skills || []);
    }
  }, [jobData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleImagePick = async () => {
    launchImageLibrary({ mediaType: 'photo' }, async (res) => {
      if (res.didCancel || res.errorCode || !res.assets || res.assets.length === 0) {
        Toast.show({ type: 'error', text1: 'Image selection cancelled or failed.' });
        return;
      }

      const asset = res.assets[0];
      const uri = Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', '');
      const { type, fileName } = asset;

      if (!uri || !type || !fileName) {
        Toast.show({ type: 'error', text1: 'Invalid image. Please try another file.' });
        return;
      }

      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Toast.show({ type: 'error', text1: 'Authentication Error', text2: 'Please log in again.' });
          return;
        }

        const formData = new FormData();
        formData.append('companyLogo', {
          uri: Platform.OS === 'android' ? uri : `file://${uri}`,
          type,
          name: fileName,
        });

        setUploadingLogo(true);

        const response = await fetch(`${API_URL}/api/uploads/upload-logo-R`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();
        setUploadingLogo(false);

        if (!response.ok) throw new Error(data.error || 'Upload failed');

        handleChange('companyLogo', data.imageUrl);
        Toast.show({ type: 'success', text1: 'Logo uploaded!' });
      } catch (err) {
        setUploadingLogo(false);
        Toast.show({ type: 'error', text1: 'Upload Error', text2: err.message || 'Something went wrong.' });
      }
    });
  };

  const handleSubmit = async () => {
    const experience =
      form.experienceType === 'Experienced'
        ? `${form.experienceMin}-${form.experienceMax} years`
        : 'Fresher';

    const finalLocation = form.location === 'Other' ? customLocation.trim() : form.location;

    if (!form.companyName || !form.salary || !form.recruiterEmail || !form.description || !finalLocation) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill in all required fields.' });
      return;
    }

    if (form.experienceType === 'Experienced' && (!form.experienceMin || !form.experienceMax)) {
      Toast.show({ type: 'error', text1: 'Missing Experience', text2: 'Please specify experience range.' });
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        Toast.show({ type: 'error', text1: 'Authentication error — please log in again.' });
        return;
      }

      const verifyRes = await fetch(`${API_URL}/api/recruiters/check-email-verified/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        Toast.show({ type: 'info', text1: 'Email Not Verified', text2: 'Redirecting to Settings...' });
        setTimeout(() => {
          navigation.navigate('Setting');
        }, 3000);
        return;
      }

      const jobDataToSend = {
        jobTitle: form.jobTitle,
        companyName: form.companyName,
        companyLogo: form.companyLogo || '',
        salary: form.salary,
        experience,
        location: finalLocation,
        description: form.description,
        jobType: form.jobType,
        remote: finalLocation === 'Remote',
        skills: selectedSkills,
        recruiterEmail: form.recruiterEmail,
        openings: Number(form.openings),
        applicants: [],
        postedBy: userId,
      };
      
      const response = await fetch(
        jobData ? `${API_URL}/api/recruiters/update-post` : `${API_URL}/api/recruiters/create`,
        {
          method: jobData ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...jobDataToSend,
            ...(jobData && { oldTitle: jobData.jobTitle }),
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Toast.show({ type: 'success', text1: jobData ? 'Job updated successfully' : 'Job posted successfully' });
        navigation.navigate('Home-R');
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: result.message || 'Error posting job' });
      }
    } catch (err) {
      console.error(' Network / fetch error →', err);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Error submitting job post' });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.heading}>Post a Job</Text>
      </View>

      {/* Job Title */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Job Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Frontend Developer"
          value={form.jobTitle}
          onChangeText={(text) => handleChange('jobTitle', text)}
        />
      </View>

      {/* Company Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Company Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Infosys"
          value={form.companyName}
          onChangeText={(text) => handleChange('companyName', text)}
        />
      </View>

      {/* Company Logo Upload */}
      <View style={styles.inputGroup}>
  <Text style={styles.label}>Company Logo (Optional)</Text>

  {form.companyLogo ? (
    <Image
      source={{ uri: form.companyLogo }}
      style={{ width: 100, height: 100, borderRadius: 8, marginBottom: 8 }}
    />
  ) : null}

  <TouchableOpacity
    style={[styles.uploadButton, uploadingLogo && { opacity: 0.5 }]}
    onPress={handleImagePick}
    disabled={uploadingLogo}
  >
    <Text style={styles.uploadButtonText}>
      {uploadingLogo
        ? 'Uploading...'
        : form.companyLogo
        ? 'Change Logo'
        : 'Upload Logo'}
    </Text>
  </TouchableOpacity>
</View>


      {/* Salary */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Salary</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., ₹6-12 LPA"
          value={form.salary}
          onChangeText={(text) => handleChange('salary', text)}
        />
      </View>

      {/* Openings */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Number of Openings</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 5"
          keyboardType="numeric"
          value={form.openings}
          onChangeText={(text) => handleChange('openings', text)}
        />
      </View>

      {/* Experience */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Experience</Text>
        <View style={styles.radioRow}>
          {['Fresher', 'Experienced'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.radioOption, form.experienceType === type && styles.radioSelected]}
              onPress={() => handleChange('experienceType', type)}
            >
              <Text style={[styles.radioText, form.experienceType === type && styles.radioTextSelected]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {form.experienceType === 'Experienced' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Min Years"
              keyboardType="numeric"
              value={form.experienceMin}
              onChangeText={(text) => handleChange('experienceMin', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Max Years"
              keyboardType="numeric"
              value={form.experienceMax}
              onChangeText={(text) => handleChange('experienceMax', text)}
            />
          </>
        )}
      </View>

      {/* Job Location Picker with Other */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Job Location</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.location}
            onValueChange={(value) => handleChange('location', value)}
            style={styles.picker}
          >
            {['Remote', 'Hyderabad', 'Bangalore', 'Chennai', 'Mumbai', 'Other'].map((loc) => (
              <Picker.Item key={loc} label={loc} value={loc} />
            ))}
          </Picker>
        </View>
        {form.location === 'Other' && (
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Enter custom location"
            value={customLocation}
            onChangeText={setCustomLocation}
          />
        )}
      </View>

      {/* Job Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Job Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.jobType}
            onValueChange={(value) => handleChange('jobType', value)}
            style={styles.picker}
          >
            {['Full-time', 'Part-time', 'Internship', 'Contract'].map((type) => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Job Description</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          multiline
          placeholder="Describe the job role and responsibilities"
          value={form.description}
          onChangeText={(text) => handleChange('description', text)}
        />
      </View>

      {/* Skills */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Required Skills</Text>
        <View style={styles.skillInputRow}>
          <TextInput
            style={[styles.input, { flex: 1, color: 'black' }]}
            placeholder="Add a new skill"
            value={customSkill}
            onChangeText={setCustomSkill}
          />
          <TouchableOpacity
            style={[styles.addButton, customSkill.trim() ? styles.addButtonActive : styles.addButtonInactive]}
            onPress={() => {
              const trimmed = customSkill.trim();
              if (trimmed && !selectedSkills.includes(trimmed)) {
                setSelectedSkills((prev) => [...prev, trimmed]);
                setCustomSkill('');
              }
            }}
            disabled={!customSkill.trim()}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.skillsContainer}>
          {[...skillsList, ...selectedSkills.filter((s) => !skillsList.includes(s))].map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[styles.skillItem, selectedSkills.includes(skill) && styles.skillItemSelected]}
              onPress={() => toggleSkill(skill)}
            >
              <Text style={[styles.skillText, selectedSkills.includes(skill) && styles.skillTextSelected]}>
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recruiter Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Recruiter Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={form.recruiterEmail}
          onChangeText={(text) => handleChange('recruiterEmail', text)}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.postButton} onPress={handleSubmit}>
        <Text style={styles.postButtonText}>{jobData ? 'Update Job' : 'Post Job'}</Text>
      </TouchableOpacity>
      
    </ScrollView>
    
  );
};
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  container: { padding: 10, backgroundColor: '#FFFFFF' },
  heading: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 16, color: '#333' },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 4, color: '#222', fontWeight: '500' },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginTop: 4,
    color: 'black',
  },
  picker: { backgroundColor: '#fff', color: 'black' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  skillInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  addButton: { paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8, borderRadius: 4 },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  addButtonActive: { backgroundColor: '#5A1EFF' },
  addButtonInactive: { backgroundColor: '#aaa' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 4, columnGap: 4 },
  skillItem: { paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#eee', borderRadius: 20 },
  skillItemSelected: { backgroundColor: '#5A1EFF' },
  skillText: { color: '#333' },
  skillTextSelected: { color: '#fff', fontWeight: 'bold' },
  postButton: { backgroundColor: '#5A1EFF', paddingVertical: 14, borderRadius: 6, marginTop: 20, alignItems: 'center' },
  postButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  radioRow: { flexDirection: 'row', gap: 10, marginVertical: 6 },
  radioOption: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#888', borderRadius: 20 },
  radioSelected: { backgroundColor: '#5A1EFF' },
  radioText: { color: '#333' },
  radioTextSelected: { color: '#fff', fontWeight: 'bold' },
  uploadButton: {
    backgroundColor: '#5A1EFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  uploadButtonText: { color: 'white', fontWeight: 'bold' },
});

export default PostJobs;
