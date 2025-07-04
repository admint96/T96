import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../config';
import Toast from 'react-native-toast-message';
import { toastConfig } from './toastConfig';

const JobCard = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { job } = route.params;
   console.log('ApI URL:', API_URL);

  const [user, setUser] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const fetchUserProfile = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/users/userdetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUser(data);
      checkEmailVerified(data.id);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const checkEmailVerified = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/users/check-email-verified/${userId}`);
      const data = await res.json();
      console.log('Email verification status:', data);
      setIsEmailVerified(data.verified);
    } catch (err) {
      console.error('Email verification check failed:', err);
    }
  };

  const checkIfApplied = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token || !job?._id) return;

    try {
      const res = await fetch(`${API_URL}/api/recruiters/${job._id}/is-applied`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = res.headers.get('Content-Type');
      if (!res.ok || !contentType.includes('application/json')) return;

      const data = await res.json();
      setAlreadyApplied(data?.applied ?? false);
    } catch (err) {
      console.error('Failed to check if applied:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchUserProfile(), checkIfApplied()]);
        setLoading(false);
      };
      loadData();

      return () => {}; 
    }, [job._id])
  );

  const handleApplyJob = async () => {
    const token = await AsyncStorage.getItem('token');

    if (!user) return;

    if (!isEmailVerified) {
      ToastAndroid.showWithGravity(
        'Please verify your email before applying.',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
      setTimeout(() => {
        navigation.navigate('Setting');
      }, 2000);
      return;
    }

    const requiredFields = {
      userId: user.id,
      name: user.fullName,
      email: user.email,
      resume: user.resume,
      address: user.address,
      profileImage: user.profileImage,
    };

    const missing = Object.entries(requiredFields).find(([_, value]) => !value);
    if (missing) {
      ToastAndroid.showWithGravity(
        'Please complete your profile before applying.',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
      setTimeout(() => {
        navigation.navigate('Profile');
      }, 2000);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/recruiters/${job._id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requiredFields),
      });

      const result = await res.json();
      if (res.ok) {
        setAlreadyApplied(true);

        Toast.show({
          type: 'success',
          text1: 'Application Submitted',
          text2: 'You have successfully applied to the job!',
          position: 'top',
          visibilityTime: 2500,
        });

        setTimeout(() => {
          navigation.navigate('Home');
        }, 2000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Application Failed',
          text2: result.message || 'Something went wrong',
        });
      }
    } catch (error) {
      console.error('Application error:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please try again later.',
      });
    }
  };

  const skillsArray = job.skills || job.Skills || [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <MaterialIcons name="bookmark-border" size={24} color="#333" />
      </View>

      <View style={styles.companyContainer}>
        {job.companyLogo ? (
          <Image source={{ uri: job.companyLogo }} style={styles.companyLogo} />
        ) : (
          <MaterialIcons name="business" size={60} color="#6C63FF" />
        )}
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.companyName}>{job.companyName}</Text>
          <Text style={styles.jobTitle}>{job.jobTitle}</Text>
        </View>
      </View>

      <View style={styles.tagsContainer}>
        <Text style={styles.tag}>{job.jobType}</Text>
        {job.remote && <Text style={styles.tag}>Remote Working</Text>}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <MaterialIcons name="attach-money" size={20} color="#6C63FF" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.infoTitle}>Salary</Text>
            <Text style={styles.infoValue}>{job.salary} LPA</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <MaterialIcons name="location-on" size={20} color="#6C63FF" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.infoTitle}>Location</Text>
            <Text style={styles.infoValue}>{job.location}</Text>
          </View>
        </View>

        {job.experience && (
          <View style={styles.infoItem}>
            <MaterialIcons name="work-outline" size={20} color="#6C63FF" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.infoTitle}>Experience</Text>
              <Text style={styles.infoValue}>{job.experience}</Text>
            </View>
          </View>
        )}

        {job.openings && (
          <View style={styles.infoItem}>
            <MaterialIcons name="group" size={20} color="#6C63FF" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.infoTitle}>Openings</Text>
              <Text style={styles.infoValue}>{job.openings}</Text>
            </View>
          </View>
        )}

        {job.postedAt && (
          <View style={styles.infoItem}>
            <MaterialIcons name="event" size={20} color="#6C63FF" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.infoTitle}>Posted</Text>
              <Text style={styles.infoValue}>{new Date(job.postedAt).toDateString()}</Text>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Job Description</Text>
      <Text style={styles.description}>{job.description}</Text>

      {skillsArray.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Required Skills</Text>
          <View style={styles.bulletList}>
            {skillsArray.map((skill, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <MaterialIcons name="check-circle" size={16} color="#6C63FF" />
                <Text style={styles.bulletText}>{skill}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.applyButton, alreadyApplied && styles.disabledButton]}
        onPress={handleApplyJob}
        disabled={alreadyApplied}
      >
        <Text style={[styles.applyButtonText, alreadyApplied && styles.disabledButtonText]}>
          {alreadyApplied ? 'APPLIED' : 'APPLY JOB'}
        </Text>
      </TouchableOpacity>

      <Toast config={toastConfig} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '500',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  companyContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  companyLogo: { width: 60, height: 60, borderRadius: 8 },
  companyName: { fontSize: 14, color: '#555' },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  tag: {
    backgroundColor: '#eee',
    color: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: { marginVertical: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  infoTitle: { fontSize: 12, color: '#555' },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 12, color: '#333' },
  description: { fontSize: 14, color: '#555', marginVertical: 8 },
  bulletList: { marginVertical: 8 },
  bulletItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  bulletText: { marginLeft: 6, fontSize: 14, color: '#333' },
  applyButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#ccc' },
  disabledButtonText: { color: '#666' },
});

export default JobCard;
