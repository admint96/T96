import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {API_URL} from '../../config';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/Ionicons';


export default function UpdateProfileScreen({ navigation }) {
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [graduation, setGraduation] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [resumeUri, setResumeUri] = useState('');
  const [workStatus, setWorkStatus] = useState('');
  const [experiences, setExperiences] = useState('');
  const [ctc, setCtc] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [currentIndustry, setCurrentIndustry] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [currentSalaryFixed, setCurrentSalaryFixed] = useState('');
  const [currentSalaryVariable, setCurrentSalaryVariable] = useState('');
  const [isCurrentCompany, setIsCurrentCompany] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isOngoing, setIsOngoing] = useState(false);
  const [payType, setPayType] = useState('');
  const [skills, setSkills] = useState([]);
  const [rolesSummary, setRolesSummary] = useState('');
  const [educationList, setEducationList] = useState([]);
  const [address, setAddress] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [fileName, setFileName] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [employmentList, setEmploymentList] = useState([]);
  const [currentlyServingNotice, setCurrentlyServingNotice] = useState(false);
  const [noticeEndDate, setNoticeEndDate] = useState(null);
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [dob, setDob] = useState('');
  const [expectedctc,setExpectedctc]=useState('');

  const arrayToString = (arr) => {
    if (!Array.isArray(arr)) return 'None';
    const filtered = arr.filter(Boolean);
    return filtered.length > 0 ? filtered.join(', ') : 'None';
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      const result = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
      return result === RESULTS.GRANTED;
    } else if (Platform.OS === 'ios') {
      const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      return result === RESULTS.GRANTED;
    }
    return false;
  };

  const handleUploadImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'You need to allow gallery access.');
      return;
    }
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      const image = response.assets[0];
      const formData = new FormData();
      formData.append('profileImage', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
      try {
        setImageUploading(true);
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/uploads/upload-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          setProfileImage(data.imageUrl);
          Alert.alert('Success', 'Image uploaded');
        } else {
          Alert.alert('Error', data.error || 'Upload failed');
        }
      } catch (err) {
        Alert.alert('Error', 'Upload failed');
      } finally {
        setImageUploading(false);
      }
    });
  };

  const selectDoc = async () => {
    try {
      setResumeUploading(true);
      const pickedFiles = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        allowMultiSelection: false,
      });
      const file = pickedFiles[0];
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
      const response = await fetch(`${API_URL}/api/uploads/upload-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Resume uploaded');
        setResumeUri(data.resumeUrl);
        setFileName(file.name);
        setUploadDate(new Date().toLocaleDateString());
      } else {
        Alert.alert('Error', data.error || 'Upload failed');
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Something went wrong');
      }
    } finally {
      setResumeUploading(false);
    }
  };

  const loadUserData = async (token, userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users/userdata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      setFullName(data.fullName || '');
      setGraduation(data.graduation || '');
      setGender(data.gender || '');
      setEmail(data.email || '');
      setMobileNumber(data.mobileNumber || '');
      setProfileImage(data.profileImage || '');
      setWorkStatus(data.workStatus || '');
      const basic = data.basicDetails || {};
      console.log('UpdateProfileScreen basic',basic);

      setExpectedctc(basic.expectedCtc || '');
      setLocation(basic.location || '');
      setExperiences(basic.experience || '');
      setCtc(basic.ctc || '');
      setNoticePeriod(basic.noticePeriod || '');
      setCurrentlyServingNotice(basic.currentlyServingNotice || false);
      setNoticeEndDate(basic.noticeEndDate || null);
      setResumeUri(data.resume || '');
      setEducationList(data.education || []);
      setSkills(data.skills?.technologies || []);
      const summaries = data.rolesAndResponsibilities?.summaries;
      setRolesSummary(
        Array.isArray(summaries)
          ? summaries.join(', ')
          : summaries
            ? String(summaries)
            : ''
      );
      const prof = data.professionalDetails || {};
      setCurrentIndustry(prof.currentIndustry || '');
      setDepartment(prof.department || '');
      setDesignation(prof.designation || '');
      const per = data.personalDetails || {};
      setAddress(per.address || '');
      setIsDisabled(per.isDisabled || false);
      setLanguages(per.languages || []);
      setGender(per.gender || '');
      setMaritalStatus(per.maritalStatus || '');
      setDob(per.dateOfBirth || '');
      const employmentArray = data.employmentDetailsList || [];
      setEmploymentList(Array.isArray(employmentArray) ? employmentArray : []);
      if (data.resume) {
        try {
          const name = decodeURIComponent(data.resume.split('/').pop() || 'resume.pdf');
          setFileName(name);
        } catch {
          setFileName('resume.pdf');
        }
        setUploadDate(new Date().toLocaleDateString());
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch profile data');
    } finally {
      setLoading(false);
    }
  };
 
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const savedToken = await AsyncStorage.getItem('token');
        const savedUserId = await AsyncStorage.getItem('userId');
        if (savedToken && savedUserId) {
          setToken(savedToken);
          setUserId(savedUserId);
          await loadUserData(savedToken, savedUserId);
        } else {
          Alert.alert('Error', 'Authentication data missing');
          setLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return isNaN(date) ? '-' : date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

   const deleteEmployment = async (employmentId, index) => {
    try {
      const res = await fetch(`${API_URL}/api/users/employment/${userId}/${employmentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (res.ok) {
        const updatedList = employmentList.filter((_, i) => i !== index);
        setEmploymentList(updatedList);
      } else {
        Alert.alert('Error', result.message || 'Failed to delete employment entry.');
      }
    } catch (err) {
      console.error('Delete Employment Error:', err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  // DELETE education entry
  const deleteEducation = async (educationId, index) => {
    try {
      const res = await fetch(`${API_URL}/api/users/education/${userId}/${educationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (res.ok) {
        const updatedList = educationList.filter((_, i) => i !== index);
        setEducationList(updatedList);
      } else {
        Alert.alert('Error', result.message || 'Failed to delete education entry.');
      }
    } catch (err) {
      console.error('Delete Education Error:', err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
   <Icon
  name="arrow-back"
  size={30}
  color="#000"
  style={{ marginRight:70, marginTop: 5 }}
  onPress={() => navigation.goBack()}
/>

  </TouchableOpacity>
  <Text style={styles.headerTitle}>Update Profile</Text>
</View>
     

      {/* Profile Image */}
      <Image source={{ uri: profileImage }} style={styles.avatar} />
      <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadImage}>
        {imageUploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.uploadText}>Change Profile Picture</Text>
        )}
      </TouchableOpacity>

      {/* Basic Details */}
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('Edit Basic Details', {
            token,
            userId,
            location,
            experiences,
            ctc,
            expectedctc,
            noticePeriod,
            currentlyServingNotice,
            noticeEndDate,
          })
        }
      >
        <Text style={styles.sectionTitle}>Basic Details</Text>
        <Text style={styles.previewText}>Location: {location}</Text>
        <Text style={styles.previewText}>Experiences: {experiences}</Text>
        <Text style={styles.previewText}>CTC: {ctc}</Text>
        <Text style={styles.previewText}>Expected CTC: {expectedctc}</Text>
        <Text style={styles.previewText}>Notice Period: {noticePeriod}</Text>
        {currentlyServingNotice && noticeEndDate && (
          <Text style={styles.previewText}>
            Currently Serving Notice: {new Date(noticeEndDate).toLocaleDateString()}
          </Text>
        )}
      </TouchableOpacity>

      {/* Professional Details */}
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('Edit Professional Details', {
            userId,
            currentIndustry,
            department,
            designation,
          })
        }
      >
        <Text style={styles.sectionTitle}>Professional Details</Text>
         <Text style={styles.previewText}>Designation: {designation}</Text>
        <Text style={styles.previewText}>Professional Summary: <Text style={styles.summaryText}>{department}</Text></Text>

       
      </TouchableOpacity>

      {/* Employment Section */}
<View style={styles.card}>
  <View style={styles.educationHeader}>
    <Text style={styles.sectionTitle}>Employment</Text>
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('Edit Employment Details', {
          mode: 'add',
          employment: {},
          userId,
          token,
          onSave: (newEntry) => setEmploymentList((prev) => [...prev, newEntry]),
        })
      }
    >
      <Ionicons name="add-circle-outline" size={24} color="#007bff" />
    </TouchableOpacity>
  </View>

  {employmentList.length === 0 ? (
    <Text style={styles.previewText}>No employment details added yet.</Text>
  ) : (
    employmentList.map((job, index) => (
      <View key={job._id || index} style={styles.educationCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eduhead}>{job.company}</Text>
          <Text style={styles.previewText}>Role: {job.jobTitle}</Text>
          <Text style={styles.previewText}>Pay Type: {job.payType}</Text>
          {job.currentSalaryFixed && (
            <Text style={styles.previewText}>Fixed: {job.currentSalaryFixed}</Text>
          )}
          {job.currentSalaryVariable && (
            <Text style={styles.previewText}>Variable: {job.currentSalaryVariable}</Text>
          )}
          <Text style={styles.previewText}>
            Duration: {job.startDate} - {job.isOngoing ? 'Ongoing' : job.endDate}
          </Text>
          <Text style={styles.previewText}>
            Currently Employed: {job.isCurrentCompany ? 'Yes' : 'No'}
          </Text>
        </View>

        {/* Icon Row */}
        <View style={styles.iconRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate('Edit Employment Details', {
                mode: 'edit',
                employment: job,
                index,
                userId,
                token,
                onUpdate: (updatedEntry) => {
                  const updatedList = [...employmentList];
                  updatedList[index] = updatedEntry;
                  setEmploymentList(updatedList);
                },
              })
            }
          >
            <Ionicons name="pencil" size={20} color="#007bff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              Alert.alert(
                'Delete Entry',
                'Are you sure you want to delete this employment entry?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                   onPress: () => deleteEmployment(job._id, index),

                  },
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={20} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    ))
  )}
</View>

      {/* Skills */}
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('Edit Skills Details', {
            skills,
            onSave: (updatedSkills) => setSkills(updatedSkills),
          })
        }
      >
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {skills.length === 0 ? (
            <Text style={styles.noSkillsText}>No skills added</Text>
          ) : (
            skills.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))
          )}
        </View>
      </TouchableOpacity>

      {/* Education */}
      <View style={styles.card}>
        <View style={styles.educationHeader}>
          <Text style={styles.sectionTitle}>Education</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Edit Education Details', {
                mode: 'add',
                edu: {
                  qualification: '',
                  course: '',
                  college: '',
                  grading: '',
                  cgpa: '',
                  courseType: '',
                  startYear: '',
                  endYear: '',
                },
                onSave: (newEntry) => setEducationList((prev) => [...prev, newEntry]),
              })
            }
          >
            <Ionicons name="add-circle-outline" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
        {educationList.length === 0 ? (
          <Text style={styles.previewText}>No education added</Text>
        ) : (
          educationList.map((edu, index) => {
            const isSchool = edu.qualification === 'Class X' || edu.qualification === 'Class XII';
            return (
              <View key={edu._id || index} style={styles.educationCard}>
                <View style={{ flex: 1 }}>
                  {isSchool ? (
                    <>
                      <Text style={styles.eduhead}>{edu.qualification}</Text>
                      <Text style={styles.previewText}>{edu.board}, {edu.medium}</Text>
                      <Text style={styles.previewText}>Scored {edu.percentage}% , Passed out in {edu.yearOfPassing}</Text>
                    </>
                  ) : (
                    <View style={styles.row}>
                      <Text style={styles.eduhead}>{edu.course}</Text>
                      <View style={styles.column}>
                        <Text style={styles.previewText}>{edu.college}</Text>
                        <Text style={styles.previewText}>Scored {edu.cgpa} {edu.grading}</Text>
                        <Text style={styles.previewText}>Graduating in {edu.endYear}, {edu.courseType}</Text>
                      </View>
                    </View>
                  )}
                </View>
                <View style={styles.iconColumn}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() =>
                      navigation.navigate('Edit Education Details', {
                        mode: 'edit',
                        edu,
                        index,
                        onUpdate: (updatedEntry) => {
                          const updatedList = [...educationList];
                          updatedList[index] = updatedEntry;
                          setEducationList(updatedList);
                        },
                      })
                    }
                  >
                    <Ionicons name="pencil" size={20} color="#007bff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      Alert.alert(
                        'Delete Entry',
                        'Are you sure you want to delete this education entry?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                           onPress: () => deleteEducation(edu._id, index),

                            
                          },
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Personal Details */}
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('Edit Personal Details', {
            address,
            isDisabled,
            languages,
            dob,
            gender,
            maritalStatus,
          })
        }
      >
        <Text style={styles.sectionTitle}>Personal Details</Text>

        <Text style={styles.previewText}>Address: {address || '-'}</Text>
        <Text style={styles.previewText}>Disability: {isDisabled ? 'Yes' : 'No'}</Text>

        <Text style={styles.previewText}>Gender: {gender || '-'}</Text>
        <Text style={styles.previewText}>Marital Status: {maritalStatus || '-'}</Text>
        <Text style={styles.previewText}>Date of Birth: {formatDate(dob)}</Text>

        <Text style={styles.previewText}>Languages :</Text>
        {languages.length > 0 ? (
          languages.map((lang, index) => (
            <Text key={index} style={styles.previewText}>
              - {lang.language} ({lang.proficiency || 'Unknown'}) |{' '}
              R: <Text style={{ color: lang.canRead ? 'green' : 'red' }}>
                {lang.canRead ? '✓' : '✗'}
              </Text>{' '}
              W: <Text style={{ color: lang.canWrite ? 'green' : 'red' }}>
                {lang.canWrite ? '✓' : '✗'}
              </Text>{' '}
              S: <Text style={{ color: lang.canSpeak ? 'green' : 'red' }}>
                {lang.canSpeak ? '✓' : '✗'}
              </Text>
            </Text>
          ))
        ) : (
          <Text style={styles.previewText}>-</Text>
        )}
      </TouchableOpacity>

      {/* Resume Upload Section */}
      <View style={styles.resumeContainer}>
        <View style={styles.resumeHeaderRow}>
          <Text style={styles.resumeHeaderTitle}>Resume</Text>
          <TouchableOpacity
            onPress={selectDoc}
            disabled={resumeUploading}
          >
            {resumeUploading ? (
              <ActivityIndicator size="small" color="blue" />
            ) : (
              <Ionicons name="cloud-upload-outline" size={24} color="blue" />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.resumeCardBox}>
          <Ionicons name="document-outline" size={28} color="#333" style={styles.resumeDocIcon} />
          <View style={styles.resumeDocDetails}>
            <Text style={styles.resumeFileName}>{fileName || 'No resume uploaded'}</Text>
            {fileName && (
              <Text style={styles.resumeDateText}>{uploadDate || 'Unknown date'}</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  uploadBtn: {
    marginBottom: 20,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
  },
  uploadText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    marginVertical: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewText: {
    color: '#555',
    fontSize: 14,
    marginTop: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  skillBadge: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: 'white',
    fontSize: 14,
  },
  noSkillsText: {
    fontStyle: 'italic',
    color: '#999',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  educationCard: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  iconButton: {
    padding: 4,
    marginVertical: 4,
  },
  editIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
    zIndex: 10,
  },
  eduhead: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'column',
  },
  column: {
    marginLeft: 10,
  },
  resumeContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  resumeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resumeHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  resumeUpdateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a73e8',
  },
  resumeCardBox: {
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  resumeDocIcon: {
    backgroundColor: '#e4ebff',
    padding: 10,
    borderRadius: 32,
    marginRight: 12,
  },
  resumeDocDetails: {
    flex: 1,
  },
  resumeFileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  resumeDateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20,
},
headerTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginRight: 100,
},


previewText: {
  fontSize: 16,
  color: '#333',
  marginTop: 10,
},

summaryText: {
  fontStyle: 'italic',
  fontWeight: '300',
  color: 'black',
  fontSize: 12,
},

});